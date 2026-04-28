import SwiftUI

public enum JJIM {
    public enum Clay {
        public static let deep   = Color(red: 0.227, green: 0.094, blue: 0.063) // #3a1810
        public static let dark   = Color(red: 0.353, green: 0.173, blue: 0.078) // #5a2c14
        public static let mid    = Color(red: 0.541, green: 0.282, blue: 0.125) // #8a4820
        public static let base   = Color(red: 0.722, green: 0.416, blue: 0.251) // #B86A40
        public static let light  = Color(red: 0.784, green: 0.471, blue: 0.290) // #C8784a
        public static let glow   = Color(red: 1.000, green: 0.690, blue: 0.439) // #FFB070
        public static let bright = Color(red: 1.000, green: 0.839, blue: 0.541) // #FFD68A
    }

    public enum Floor {
        public static let dark  = Color(red: 0.353, green: 0.227, blue: 0.094) // #5a3a18
        public static let mid   = Color(red: 0.549, green: 0.384, blue: 0.220) // #8c6238
        public static let light = Color(red: 0.612, green: 0.439, blue: 0.282) // #9c7048
    }

    public enum Text {
        public static let primary   = Color(red: 1.000, green: 0.910, blue: 0.784) // #FFE8C8
        public static let secondary = Color(red: 1.000, green: 0.863, blue: 0.706).opacity(0.78)
        public static let tertiary  = Color(red: 1.000, green: 0.863, blue: 0.706).opacity(0.60)
        public static let muted     = Color(red: 1.000, green: 0.863, blue: 0.706).opacity(0.42)
        public static let dim       = Color(red: 1.000, green: 0.863, blue: 0.706).opacity(0.28)
    }

    public enum Accent {
        public static let primary = Color(red: 1.000, green: 0.565, blue: 0.314) // #FF9050
        public static let warm    = Color(red: 1.000, green: 0.690, blue: 0.376) // #FFB060
        public static let soft    = Color(red: 1.000, green: 0.831, blue: 0.627) // #FFD4A0
        public static let deepEnd = Color(red: 0.788, green: 0.345, blue: 0.188) // #C95830
    }

    public enum Surface {
        public static let panel          = Color(red: 0.157, green: 0.059, blue: 0.020).opacity(0.72)
        public static let panelStrong    = Color(red: 0.157, green: 0.059, blue: 0.020).opacity(0.88)
        public static let panelLight = Color(red: 0.157, green: 0.059, blue: 0.020).opacity(0.45)
        public static let hairline       = Color(red: 1.000, green: 0.706, blue: 0.471).opacity(0.28)
        public static let hairlineStrong = Color(red: 1.000, green: 0.706, blue: 0.471).opacity(0.42)
    }

    public enum Radius {
        public static let sm: CGFloat   = 8
        public static let md: CGFloat   = 12
        public static let lg: CGFloat   = 14
        public static let xl: CGFloat   = 18
        public static let xxl: CGFloat  = 22
        public static let pill: CGFloat = 999
    }

    public enum Spacing {
        public static let xs: CGFloat  = 4
        public static let sm: CGFloat  = 8
        public static let md: CGFloat  = 14
        public static let lg: CGFloat  = 20
        public static let xl: CGFloat  = 28
        public static let xxl: CGFloat = 36
    }

    public enum Bg {
        public static let appDeep = Color(red: 0.039, green: 0.024, blue: 0.016) // #0a0604
    }
}
