Imports System.Drawing.Drawing2D
Imports System.ComponentModel

Public Enum ShadowDirection
    None = 0
    Left = 1
    Top = 2
    Right = 4
    Bottom = 8
End Enum

Public Class RoundedShadowPanel
    Inherits Control

    Private _borderRadius As Integer = 6
    Private _borderSize As Integer = 1
    Private _borderColor As Color = Color.LightGray
    Private _panelColor As Color = Color.WhiteSmoke

    Private _shadowColor As Color = Color.FromArgb(80, Color.Black)
    Private _shadowOffsetX As Integer = 3
    Private _shadowOffsetY As Integer = 3

    Private _shadowBlur As Integer = 5
    Private _shadowOpacity As Integer = 80

    <Category("Appearance")>
    Public Property BorderRadius As Integer
        Get
            Return _borderRadius
        End Get
        Set(value As Integer)
            _borderRadius = value
            Me.Invalidate()
        End Set
    End Property

    <Category("Appearance")>
    Public Property BorderSize As Integer
        Get
            Return _borderSize
        End Get
        Set(value As Integer)
            _borderSize = value
            Me.Invalidate()
        End Set
    End Property

    <Category("Appearance")>
    Public Property BorderColor As Color
        Get
            Return _borderColor
        End Get
        Set(value As Color)
            _borderColor = value
            Me.Invalidate()
        End Set
    End Property

    <Category("Appearance")>
    Public Property PanelColor As Color
        Get
            Return _panelColor
        End Get
        Set(value As Color)
            _panelColor = value
            Me.Invalidate()
        End Set
    End Property

    <Category("Shadow")>
    Public Property ShadowColor As Color
        Get
            Return _shadowColor
        End Get
        Set(value As Color)
            _shadowColor = value
            Me.Invalidate()
        End Set
    End Property

    <Category("Shadow")>
    Public Property ShadowOffsetX As Integer
        Get
            Return _shadowOffsetX
        End Get
        Set(value As Integer)
            _shadowOffsetX = value
            Me.Invalidate()
        End Set
    End Property

    <Category("Shadow")>
    Public Property ShadowOffsetY As Integer
        Get
            Return _shadowOffsetY
        End Get
        Set(value As Integer)
            _shadowOffsetY = value
            Me.Invalidate()
        End Set
    End Property

    <Category("Shadow")>
    Public Property ShadowBlur As Integer
        Get
            Return _shadowBlur
        End Get
        Set(value As Integer)
            _shadowBlur = Math.Max(1, value)
            Me.Invalidate()
        End Set
    End Property

    Private _shadowDirection As ShadowDirection = ShadowDirection.Bottom Or ShadowDirection.Right

    <Category("Shadow")>
    Public Property ShadowDirection As ShadowDirection
        Get
            Return _shadowDirection
        End Get
        Set(value As ShadowDirection)
            _shadowDirection = value
            Me.Invalidate()
        End Set
    End Property
    Public Sub New()
        Try
            ' REQUIRED for custom painting
            Me.SetStyle(ControlStyles.UserPaint Or
                ControlStyles.AllPaintingInWmPaint Or
                ControlStyles.OptimizedDoubleBuffer Or
                ControlStyles.ResizeRedraw Or
                ControlStyles.SupportsTransparentBackColor, True)

            Me.UpdateStyles()

            ' Allowed now
            Me.BackColor = Color.Transparent
        Catch ex As Exception
            MsgBox("Error in constructor")
        End Try
    End Sub

    Public Function GetRoundedPath(rect As Rectangle, radius As Integer) As GraphicsPath
        Try
            Dim path As New GraphicsPath()
            Dim d As Integer = radius * 2

            path.StartFigure()
            path.AddArc(rect.X, rect.Y, d, d, 180, 90)
            path.AddArc(rect.Right - d, rect.Y, d, d, 270, 90)
            path.AddArc(rect.Right - d, rect.Bottom - d, d, d, 0, 90)
            path.AddArc(rect.X, rect.Bottom - d, d, d, 90, 90)
            path.CloseFigure()

            Return path
        Catch ex As Exception
            MsgBox("Error in the get rounded path func")
        End Try
    End Function

    Private Sub GetShadowMultipliers(ByRef dx As Integer, ByRef dy As Integer)
        Try
            dx = 0
            dy = 0

            If (_shadowDirection And ShadowDirection.Left) = ShadowDirection.Left Then dx = -1
            If (_shadowDirection And ShadowDirection.Right) = ShadowDirection.Right Then dx = 1
            If (_shadowDirection And ShadowDirection.Top) = ShadowDirection.Top Then dy = -1
            If (_shadowDirection And ShadowDirection.Bottom) = ShadowDirection.Bottom Then dy = 1
        Catch ex As Exception
            MsgBox("Error in the Get Shadow Multipliers")
        End Try
    End Sub


    Protected Overrides Sub OnPaint(e As PaintEventArgs)
        Try
            'MyBase.OnPaint(e)

            _borderRadius = 5
            _shadowOffsetX = 2
            _shadowOffsetY = 2
            _shadowBlur = 5
            _borderSize = 0
            _shadowDirection = ShadowDirection.Bottom Or ShadowDirection.Right

            Dim g As Graphics = e.Graphics()
            g.SmoothingMode = SmoothingMode.AntiAlias

            Dim dx, dy As Integer
            GetShadowMultipliers(dx, dy)

            Dim shadowExtentX As Integer = _shadowOffsetX + _shadowBlur
            Dim shadowExtentY As Integer = _shadowOffsetY + _shadowBlur

            Dim leftPad As Integer = If(dx < 0, shadowExtentX, 0)
            Dim topPad As Integer = If(dy < 0, shadowExtentY, 0)
            Dim rightPad As Integer = If(dx > 0, shadowExtentX, 0)
            Dim bottomPad As Integer = If(dy > 0, shadowExtentY, 0)

            Dim mainRect As New Rectangle(
                leftPad,
                topPad,
                Me.Width - leftPad - rightPad,
                Me.Height - topPad - bottomPad
            )

            For i As Integer = 1 To _shadowBlur
                Dim alpha As Integer = CInt(_shadowOpacity * (1.0 - i / (_shadowBlur + 1)))
                If alpha <= 0 Then Exit For

                Dim shadowColor As Color = Color.FromArgb(alpha, _shadowColor)

                ' Calculate shadow rectangle per direction
                Dim shadowX As Integer = mainRect.X
                Dim shadowY As Integer = mainRect.Y
                Dim shadowWidth As Integer = mainRect.Width
                Dim shadowHeight As Integer = mainRect.Height

                If dx < 0 Then
                    ' Left shadow grows left
                    shadowX -= i
                    shadowWidth += i
                ElseIf dx > 0 Then
                    ' Right shadow grows right
                    shadowWidth += i
                End If

                If dy < 0 Then
                    ' Top shadow grows upward
                    shadowY -= i
                    shadowHeight += i
                ElseIf dy > 0 Then
                    ' Bottom shadow grows downward
                    shadowHeight += i
                End If

                Dim shadowRect As New Rectangle(shadowX, shadowY, shadowWidth, shadowHeight)

                Using shadowPath As GraphicsPath = GetRoundedPath(shadowRect, _borderRadius + (i \ 2))
                    Using shadowBrush As New SolidBrush(shadowColor)
                        g.FillPath(shadowBrush, shadowPath)
                    End Using
                End Using
            Next

            Using bgPath As GraphicsPath = GetRoundedPath(mainRect, _borderRadius)
                Using bgBrush As New SolidBrush(_panelColor)
                    g.FillPath(bgBrush, bgPath)
                End Using

                If _borderSize > 0 Then
                    Using pen As New Pen(_borderColor, _borderSize)
                        g.DrawPath(pen, bgPath)
                    End Using
                End If
            End Using


        Catch ex As Exception
            MsgBox("Error in Painting")
        End Try
    End Sub
End Class
