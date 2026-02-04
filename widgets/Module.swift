import ActivityKit
import ExpoModulesCore

public class ReactNativeWidgetExtensionModule: Module {
    private var currentActivity: Any? = nil

    public func definition() -> ModuleDefinition {
        Name("ReactNativeWidgetExtension")

        // MARK: - Live Activity Functions

        // Check if Live Activities are available
        Function("areActivitiesEnabled") { () -> Bool in
            if #available(iOS 16.2, *) {
                return ActivityAuthorizationInfo().areActivitiesEnabled
            }
            return false
        }

        // Start navigation Live Activity
        AsyncFunction("startActivity") { (
            destinationName: String,
            themeName: String,
            instruction: String,
            maneuverType: String,
            maneuverModifier: String,
            distanceToManeuver: Int,
            remainingDistance: Int,
            remainingDuration: Int
        ) -> String? in
            guard #available(iOS 16.2, *) else { return nil }

            let attributes = NavigationAttributes(
                destinationName: destinationName,
                deepLinkURL: "pixelmaps://",
                themeName: themeName
            )

            let eta = Date().addingTimeInterval(TimeInterval(remainingDuration))

            let state = NavigationAttributes.ContentState(
                instruction: instruction,
                maneuverType: maneuverType,
                maneuverModifier: maneuverModifier,
                distanceToManeuver: distanceToManeuver,
                remainingDistance: remainingDistance,
                remainingDuration: remainingDuration,
                eta: eta
            )

            do {
                let activity = try Activity.request(
                    attributes: attributes,
                    content: .init(state: state, staleDate: nil),
                    pushType: nil
                )
                self.currentActivity = activity
                return activity.id
            } catch {
                return nil
            }
        }

        // Update navigation Live Activity
        AsyncFunction("updateActivity") { (
            instruction: String,
            maneuverType: String,
            maneuverModifier: String,
            distanceToManeuver: Int,
            remainingDistance: Int,
            remainingDuration: Int
        ) in
            guard #available(iOS 16.2, *) else { return }
            guard let activity = self.currentActivity as? Activity<NavigationAttributes> else { return }

            let eta = Date().addingTimeInterval(TimeInterval(remainingDuration))

            let state = NavigationAttributes.ContentState(
                instruction: instruction,
                maneuverType: maneuverType,
                maneuverModifier: maneuverModifier,
                distanceToManeuver: distanceToManeuver,
                remainingDistance: remainingDistance,
                remainingDuration: remainingDuration,
                eta: eta
            )

            Task {
                await activity.update(
                    ActivityContent(state: state, staleDate: nil)
                )
            }
        }

        // End navigation Live Activity
        AsyncFunction("endActivity") { (showFinalState: Bool) in
            guard #available(iOS 16.2, *) else { return }
            guard let activity = self.currentActivity as? Activity<NavigationAttributes> else { return }

            Task {
                if showFinalState {
                    // Show "Arrived" state before dismissing
                    var finalState = activity.content.state
                    finalState.instruction = "You have arrived"
                    finalState.maneuverType = "arrive"
                    finalState.distanceToManeuver = 0

                    await activity.end(
                        ActivityContent(state: finalState, staleDate: nil),
                        dismissalPolicy: .after(Date().addingTimeInterval(10))
                    )
                } else {
                    await activity.end(nil, dismissalPolicy: .immediate)
                }
                self.currentActivity = nil
            }
        }
    }
}
