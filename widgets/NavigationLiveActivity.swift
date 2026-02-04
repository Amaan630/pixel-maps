import ActivityKit
import SwiftUI
import WidgetKit

@available(iOS 16.2, *)
struct NavigationLiveActivity: Widget {
    var body: some WidgetConfiguration {
        ActivityConfiguration(for: NavigationAttributes.self) { context in
            // Lock Screen Banner View
            LockScreenView(context: context)
        } dynamicIsland: { context in
            let theme = LiveActivityTheme.forName(context.attributes.themeName)
            let accentColor = Color(hex: theme.routeColor)

            return DynamicIsland {
                // Expanded Dynamic Island
                DynamicIslandExpandedRegion(.leading) {
                    DirectionArrowView(
                        type: context.state.maneuverType,
                        modifier: context.state.maneuverModifier,
                        color: accentColor
                    )
                    .frame(width: 44, height: 44)
                }

                DynamicIslandExpandedRegion(.trailing) {
                    VStack(alignment: .trailing, spacing: 2) {
                        Text(formatDistance(context.state.distanceToManeuver))
                            .font(.system(size: 20, weight: .bold))
                            .foregroundColor(.white)
                        Text("to turn")
                            .font(.caption2)
                            .foregroundColor(.gray)
                    }
                }

                DynamicIslandExpandedRegion(.center) {
                    Text(context.state.instruction)
                        .font(.system(size: 14, weight: .medium))
                        .lineLimit(2)
                        .multilineTextAlignment(.center)
                        .foregroundColor(.white)
                }

                DynamicIslandExpandedRegion(.bottom) {
                    HStack {
                        VStack(alignment: .leading) {
                            Text(formatDistance(context.state.remainingDistance))
                                .font(.caption)
                                .fontWeight(.medium)
                            Text("remaining")
                                .font(.caption2)
                                .foregroundColor(.gray)
                        }

                        Spacer()

                        VStack(alignment: .trailing) {
                            Text(context.state.eta, style: .time)
                                .font(.caption)
                                .fontWeight(.medium)
                            Text("ETA")
                                .font(.caption2)
                                .foregroundColor(.gray)
                        }
                    }
                    .padding(.horizontal, 8)
                }
            } compactLeading: {
                // Compact view - left pill
                DirectionArrowView(
                    type: context.state.maneuverType,
                    modifier: context.state.maneuverModifier,
                    color: accentColor
                )
                .frame(width: 24, height: 24)
            } compactTrailing: {
                // Compact view - right pill
                Text(formatDistanceCompact(context.state.distanceToManeuver))
                    .font(.system(size: 12, weight: .bold))
                    .foregroundColor(accentColor)
            } minimal: {
                // Minimal view (when other apps using Dynamic Island)
                DirectionArrowView(
                    type: context.state.maneuverType,
                    modifier: context.state.maneuverModifier,
                    color: accentColor
                )
                .frame(width: 20, height: 20)
            }
            .widgetURL(URL(string: context.attributes.deepLinkURL))
        }
    }
}

// MARK: - Lock Screen Banner View

@available(iOS 16.2, *)
struct LockScreenView: View {
    let context: ActivityViewContext<NavigationAttributes>

    var theme: LiveActivityTheme {
        LiveActivityTheme.forName(context.attributes.themeName)
    }

    var accentColor: Color {
        Color(hex: theme.routeColor)
    }

    var body: some View {
        VStack(spacing: 12) {
            HStack(spacing: 16) {
                DirectionArrowView(
                    type: context.state.maneuverType,
                    modifier: context.state.maneuverModifier,
                    color: accentColor
                )
                .frame(width: 48, height: 48)

                VStack(alignment: .leading, spacing: 4) {
                    Text(context.state.instruction)
                        .font(.system(size: 16, weight: .semibold))
                        .foregroundColor(.white)
                        .lineLimit(2)

                    Text(formatDistance(context.state.distanceToManeuver))
                        .font(.system(size: 24, weight: .bold))
                        .foregroundColor(accentColor)
                }

                Spacer()
            }

            Divider()
                .background(Color.gray.opacity(0.3))

            HStack {
                Label(context.attributes.destinationName, systemImage: "mappin.circle.fill")
                    .font(.caption)
                    .foregroundColor(.gray)
                    .lineLimit(1)

                Spacer()

                HStack(spacing: 16) {
                    VStack(alignment: .trailing) {
                        Text(formatDistance(context.state.remainingDistance))
                            .font(.caption)
                            .fontWeight(.medium)
                        Text("left")
                            .font(.caption2)
                            .foregroundColor(.gray)
                    }

                    VStack(alignment: .trailing) {
                        Text(context.state.eta, style: .time)
                            .font(.caption)
                            .fontWeight(.medium)
                        Text("ETA")
                            .font(.caption2)
                            .foregroundColor(.gray)
                    }
                }
            }
        }
        .padding(16)
        .background(Color.black)
        .widgetURL(URL(string: context.attributes.deepLinkURL))
    }
}

// MARK: - Direction Arrow Component

struct DirectionArrowView: View {
    let type: String
    let modifier: String
    let color: Color

    var body: some View {
        Image(systemName: arrowSystemName)
            .font(.system(size: 24, weight: .bold))
            .foregroundColor(color)
    }

    var arrowSystemName: String {
        switch type {
        case "arrive":
            return "mappin.circle.fill"
        case "depart":
            return "arrow.up"
        default:
            switch modifier {
            case "left":
                return "arrow.turn.up.left"
            case "right":
                return "arrow.turn.up.right"
            case "sharp left":
                return "arrow.turn.left.up"
            case "sharp right":
                return "arrow.turn.right.up"
            case "slight left":
                return "arrow.up.left"
            case "slight right":
                return "arrow.up.right"
            case "straight":
                return "arrow.up"
            case "uturn":
                return "arrow.uturn.left"
            default:
                return "arrow.up"
            }
        }
    }
}

// MARK: - Color Extension

extension Color {
    init(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: hex).scanHexInt64(&int)
        let r, g, b: UInt64
        (r, g, b) = ((int >> 16) & 0xFF, (int >> 8) & 0xFF, int & 0xFF)
        self.init(
            .sRGB,
            red: Double(r) / 255,
            green: Double(g) / 255,
            blue: Double(b) / 255
        )
    }
}

// MARK: - Helper Functions

func formatDistance(_ meters: Int) -> String {
    if meters >= 1000 {
        let km = Double(meters) / 1000.0
        return km >= 10 ? "\(Int(km)) km" : String(format: "%.1f km", km)
    }
    return "\(meters) m"
}

func formatDistanceCompact(_ meters: Int) -> String {
    if meters >= 1000 {
        return "\(meters / 1000)km"
    }
    return "\(meters)m"
}
