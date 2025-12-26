// POI Icon Configuration
// Maps OSM amenity types to GTA-style minimap blip icons

import { ThemeName } from "../themes";

// All supported POI categories
export type POICategory =
    | "gas_station"
    | "restaurant"
    | "fast_food"
    | "cafe"
    | "bar"
    | "hospital"
    | "pharmacy"
    | "police"
    | "gym"
    | "clothing"
    | "barber"
    | "tattoo"
    | "cinema"
    | "garage"
    | "car_wash"
    | "grocery"
    | "bank"
    | "hotel"
    | "school"
    | "airport"
    | "strip_club"
    | "gun_shop";

export const POI_CATEGORIES: POICategory[] = [
    "gas_station",
    "restaurant",
    "fast_food",
    "cafe",
    "bar",
    "hospital",
    "pharmacy",
    "police",
    "gym",
    "clothing",
    "barber",
    "tattoo",
    "cinema",
    "garage",
    "car_wash",
    "grocery",
    "bank",
    "hotel",
    "school",
    "airport",
    "strip_club",
    "gun_shop",
];

// Icon set configuration
export interface IconSetConfig {
    name: "gta-v" | "san-andreas";
    icons: Partial<Record<POICategory, number>>; // require() returns number
}

// GTA V Icons (from "blips" folder)
export const gtaVIcons: IconSetConfig = {
    name: "gta-v",
    icons: {
        gas_station: require("../assets/minimap-icons/gta-v/blips/Gas-can.png"),
        restaurant: require("../assets/minimap-icons/gta-v/blips/Shop.png"),
        fast_food: require("../assets/minimap-icons/gta-v/blips/Shop.png"),
        cafe: require("../assets/minimap-icons/gta-v/blips/Shop.png"),
        bar: require("../assets/minimap-icons/gta-v/blips/Bar.png"),
        hospital: require("../assets/minimap-icons/gta-v/blips/hospital.png"),
        pharmacy: require("../assets/minimap-icons/gta-v/blips/Pill.png"),
        police: require("../assets/minimap-icons/gta-v/blips/Police-station.png"),
        gym: require("../assets/minimap-icons/gta-v/blips/Yoga.png"),
        clothing: require("../assets/minimap-icons/gta-v/blips/Clothing-Store.png"),
        barber: require("../assets/minimap-icons/gta-v/blips/Barber.png"),
        tattoo: require("../assets/minimap-icons/gta-v/blips/Tattoo-parlor.png"),
        cinema: require("../assets/minimap-icons/gta-v/blips/Cinema.png"),
        garage: require("../assets/minimap-icons/gta-v/blips/Garage.png"),
        car_wash: require("../assets/minimap-icons/gta-v/blips/Car-wash.png"),
        grocery: require("../assets/minimap-icons/gta-v/blips/Dollar.png"),
        bank: require("../assets/minimap-icons/gta-v/blips/Dollar.png"),
        hotel: require("../assets/minimap-icons/gta-v/blips/Safehouse-white.png"),
        airport: require("../assets/minimap-icons/gta-v/blips/Plane.png"),
        strip_club: require("../assets/minimap-icons/gta-v/blips/Strip-Club.png"),
        gun_shop: require("../assets/minimap-icons/gta-v/blips/Ammunation.png"),
    },
};

// GTA San Andreas Icons
export const sanAndreasIcons: IconSetConfig = {
    name: "san-andreas",
    icons: {
        gas_station: require("../assets/minimap-icons/gta-san-andreas/radar_propertyG.png"),
        restaurant: require("../assets/minimap-icons/gta-san-andreas/radar_pizza.png"),
        fast_food: require("../assets/minimap-icons/gta-san-andreas/radar_burgerShot.png"),
        cafe: require("../assets/minimap-icons/gta-san-andreas/radar_diner.png"),
        bar: require("../assets/minimap-icons/gta-san-andreas/radar_dateDrink.png"),
        hospital: require("../assets/minimap-icons/gta-san-andreas/radar_hostpital.png"),
        pharmacy: require("../assets/minimap-icons/gta-san-andreas/radar_hostpital.png"),
        police: require("../assets/minimap-icons/gta-san-andreas/radar_police.png"),
        gym: require("../assets/minimap-icons/gta-san-andreas/radar_gym.png"),
        clothing: require("../assets/minimap-icons/gta-san-andreas/radar_tshirt.png"),
        barber: require("../assets/minimap-icons/gta-san-andreas/radar_barbers.png"),
        tattoo: require("../assets/minimap-icons/gta-san-andreas/radar_tattoo.png"),
        cinema: require("../assets/minimap-icons/gta-san-andreas/radar_dateDisco.png"),
        garage: require("../assets/minimap-icons/gta-san-andreas/radar_modGarage.png"),
        grocery: require("../assets/minimap-icons/gta-san-andreas/radar_cash.png"),
        bank: require("../assets/minimap-icons/gta-san-andreas/radar_mafiaCasino.png"),
        hotel: require("../assets/minimap-icons/gta-san-andreas/radar_saveGame.png"),
        school: require("../assets/minimap-icons/gta-san-andreas/radar_school.png"),
        airport: require("../assets/minimap-icons/gta-san-andreas/radar_runway.png"),
        gun_shop: require("../assets/minimap-icons/gta-san-andreas/radar_ammugun.png"),
    },
};

// Theme to icon set mapping
export const themeIconSets: Record<ThemeName, IconSetConfig> = {
    "san-andreas": sanAndreasIcons,
    western: gtaVIcons,
    "los-angeles": gtaVIcons,
    cyberpunk: gtaVIcons,
};

// Get icon set for a theme
export function getIconSetForTheme(themeName: ThemeName): IconSetConfig {
    return themeIconSets[themeName];
}

// OSM tag to POI category mapping
export interface OSMTagMapping {
    key: string;
    value: string | string[];
    category: POICategory;
}

export const osmTagMappings: OSMTagMapping[] = [
    { key: "amenity", value: "fuel", category: "gas_station" },
    { key: "amenity", value: "restaurant", category: "restaurant" },
    { key: "amenity", value: "fast_food", category: "fast_food" },
    { key: "amenity", value: "cafe", category: "cafe" },
    { key: "amenity", value: ["bar", "pub"], category: "bar" },
    { key: "amenity", value: "hospital", category: "hospital" },
    { key: "amenity", value: "pharmacy", category: "pharmacy" },
    { key: "amenity", value: "police", category: "police" },
    { key: "leisure", value: "fitness_centre", category: "gym" },
    { key: "shop", value: "clothes", category: "clothing" },
    { key: "shop", value: ["hairdresser", "beauty"], category: "barber" },
    { key: "shop", value: "tattoo", category: "tattoo" },
    { key: "amenity", value: "cinema", category: "cinema" },
    { key: "shop", value: "car_repair", category: "garage" },
    { key: "amenity", value: "car_wash", category: "car_wash" },
    { key: "shop", value: ["supermarket", "convenience"], category: "grocery" },
    { key: "amenity", value: ["bank", "atm"], category: "bank" },
    { key: "tourism", value: "hotel", category: "hotel" },
    {
        key: "amenity",
        value: ["school", "university", "college"],
        category: "school",
    },
    { key: "aeroway", value: "aerodrome", category: "airport" },
    { key: "amenity", value: "stripclub", category: "strip_club" },
    { key: "shop", value: "weapons", category: "gun_shop" },
];

// Get POI category from OSM tags
export function getCategoryFromOSMTags(
    tags: Record<string, string>
): POICategory | null {
    for (const mapping of osmTagMappings) {
        const tagValue = tags[mapping.key];
        if (!tagValue) continue;

        if (Array.isArray(mapping.value)) {
            if (mapping.value.includes(tagValue)) {
                return mapping.category;
            }
        } else if (tagValue === mapping.value) {
            return mapping.category;
        }
    }
    return null;
}
