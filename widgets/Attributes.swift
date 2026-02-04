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
    let routeColor: String  // Hex color for route/accent

    static func forName(_ name: String) -> LiveActivityTheme {
        switch name {
        case "western":
            return LiveActivityTheme(routeColor: "#ee0400")
        case "los-angeles":
            return LiveActivityTheme(routeColor: "#9552e9")
        case "san-andreas":
            return LiveActivityTheme(routeColor: "#C54040")
        case "cyberpunk":
            return LiveActivityTheme(routeColor: "#fcee0a")
        default:
            return LiveActivityTheme(routeColor: "#9552e9") // default to los-angeles
        }
    }
}
