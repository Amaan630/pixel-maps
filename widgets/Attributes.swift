import ActivityKit
import Foundation

struct NavigationAttributes: ActivityAttributes {
    // Static content - doesn't change during activity
    public struct ContentState: Codable, Hashable {
        // Dynamic content - updates during navigation
        var instruction: String           // "Turn left onto Main St"
        var maneuverType: String          // "turn", "depart", "arrive"
        var maneuverModifier: String      // "left", "right", "straight"
        var distanceToManeuver: Int       // meters to next turn
        var remainingDistance: Int        // total remaining meters
        var remainingDuration: Int        // total remaining seconds
        var eta: Date                     // calculated arrival time
    }

    // Static attributes set when activity starts
    var destinationName: String
    var deepLinkURL: String
    var themeName: String
}

// MARK: - Theme Colors for Live Activity

struct LiveActivityTheme {
    let backgroundColor: String
    let primaryTextColor: String
    let secondaryTextColor: String
    let islandPrimaryTextColor: String
    let islandSecondaryTextColor: String
    let accentColor: String
    let isDarkBackground: Bool

    static func forName(_ name: String) -> LiveActivityTheme {
        switch name {
        case "western":
            return LiveActivityTheme(
                backgroundColor: "#dec29b",
                primaryTextColor: "#40423d",
                secondaryTextColor: "#8a7a5a",
                islandPrimaryTextColor: "#f7f1e6",
                islandSecondaryTextColor: "#cbb89b",
                accentColor: "#ee0400",
                isDarkBackground: false
            )
        case "los-angeles":
            return LiveActivityTheme(
                backgroundColor: "#1a1a1a",
                primaryTextColor: "#e0e0e0",
                secondaryTextColor: "#888888",
                islandPrimaryTextColor: "#e0e0e0",
                islandSecondaryTextColor: "#9a9a9a",
                accentColor: "#9552e9",
                isDarkBackground: true
            )
        case "san-andreas":
            return LiveActivityTheme(
                backgroundColor: "#9BA4B5",
                primaryTextColor: "#1A1A2A",
                secondaryTextColor: "#E0E0E0",
                islandPrimaryTextColor: "#f2f4f8",
                islandSecondaryTextColor: "#cfd6e2",
                accentColor: "#C54040",
                isDarkBackground: false
            )
        case "cyberpunk":
            return LiveActivityTheme(
                backgroundColor: "#0a0e14",
                primaryTextColor: "#00d4ff",
                secondaryTextColor: "#4a6a7a",
                islandPrimaryTextColor: "#00d4ff",
                islandSecondaryTextColor: "#4a6a7a",
                accentColor: "#fcee0a",
                isDarkBackground: true
            )
        default:
            return LiveActivityTheme(
                backgroundColor: "#1a1a1a",
                primaryTextColor: "#e0e0e0",
                secondaryTextColor: "#888888",
                islandPrimaryTextColor: "#e0e0e0",
                islandSecondaryTextColor: "#9a9a9a",
                accentColor: "#9552e9",
                isDarkBackground: true
            ) // default to los-angeles
        }
    }
}
