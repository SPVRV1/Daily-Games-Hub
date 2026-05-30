import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

type GeoJsonRing = number[][];
type GeoJsonPolygon = GeoJsonRing[];
type GeoJsonMultiPolygon = GeoJsonPolygon[];

interface GeoJsonFeature {
    id?: string | number;
    properties?: {
        name?: string;
    };
    geometry?: {
        type: "Polygon" | "MultiPolygon";
        coordinates: GeoJsonPolygon | GeoJsonMultiPolygon;
    };
}

interface WorldleChallengeData {
    challengeId: string;
    answer: string;
    countryCode: string;
    validCountries: string[];
    silhouette: string;
}

export interface WorldleChallenge {
    gameType: "worldle";
    date: string;
    challengeData: WorldleChallengeData;
}

const resolveWorldleGeoJsonPath = (): string => {
    const moduleDir = path.dirname(fileURLToPath(import.meta.url));
    const candidates = [
        path.resolve(moduleDir, "../data/worldle.geojson"),
        path.resolve(process.cwd(), "src", "data", "worldle.geojson"),
    ];

    for (const candidate of candidates) {
        if (fs.existsSync(candidate)) {
            return candidate;
        }
    }

    throw new Error("Worldle GeoJSON asset not found");
};

const worldleGeoJson = JSON.parse(
    fs.readFileSync(resolveWorldleGeoJsonPath(), "utf8"),
) as { features: GeoJsonFeature[] };

const playableFeatures = worldleGeoJson.features.filter(
    (feature: GeoJsonFeature) => {
        const name = feature.properties?.name;
        const id = String(feature.id ?? "");

        return Boolean(name) && /^[A-Z]{3}$/.test(id);
    },
);

export const WORLDLE_VALID_COUNTRIES = playableFeatures
    .map((feature: GeoJsonFeature) => feature.properties?.name)
    .filter((name): name is string => Boolean(name))
    .sort((left: string, right: string) => left.localeCompare(right));

const pickForDate = (date: string): number => {
    let hash = 0;

    for (let index = 0; index < date.length; index += 1) {
        hash = (hash << 5) - hash + date.charCodeAt(index);
        hash |= 0;
    }

    return Math.abs(hash);
};

const collectOuterRings = (feature: GeoJsonFeature): GeoJsonRing[] => {
    if (!feature.geometry) {
        return [];
    }

    const coordinates = feature.geometry.coordinates as
        | GeoJsonPolygon
        | GeoJsonMultiPolygon;

    if (feature.geometry.type === "Polygon") {
        return coordinates.length > 0 ? [coordinates[0] as GeoJsonRing] : [];
    }

    const rings: GeoJsonRing[] = [];

    for (const polygon of coordinates as GeoJsonMultiPolygon) {
        const ring = polygon[0];

        if (ring && ring.length > 0) {
            rings.push(ring);
        }
    }

    return rings;
};

const toSvgPath = (feature: GeoJsonFeature): string => {
    const rings = collectOuterRings(feature);

    if (rings.length === 0) {
        return "";
    }

    const points = rings.flat();

    const longitudes = points.map((coordinate) => coordinate[0]);
    const latitudes = points.map((coordinate) => coordinate[1]);

    const minLongitude = Math.min(...longitudes);
    const maxLongitude = Math.max(...longitudes);
    const minLatitude = Math.min(...latitudes);
    const maxLatitude = Math.max(...latitudes);

    const width = Math.max(maxLongitude - minLongitude, 1);
    const height = Math.max(maxLatitude - minLatitude, 1);

    const scale = (longitude: number, latitude: number) => {
        const x = ((longitude - minLongitude) / width) * 230;
        const y = ((maxLatitude - latitude) / height) * 150;

        return [x, y];
    };

    return rings
        .map((ring) => {
            const path = ring
                .map((coordinate, index) => {
                    const [x, y] = scale(coordinate[0], coordinate[1]);
                    return `${index === 0 ? "M" : "L"}${x} ${y}`;
                })
                .join(" ");

            return `${path} Z`;
        })
        .join(" ");
};

export const generateWorldleChallenge = (date: string): WorldleChallenge => {
    if (playableFeatures.length === 0) {
        throw new Error("No Worldle features available");
    }

    const selectedFeature =
        playableFeatures[
            pickForDate(`worldle:${date}`) % playableFeatures.length
        ];
    const answer = selectedFeature.properties?.name ?? "Unknown country";
    const countryCode = String(selectedFeature.id ?? "").toLowerCase();

    return {
        gameType: "worldle",
        date,
        challengeData: {
            challengeId: `worldle-${date}`,
            answer,
            countryCode,
            validCountries: WORLDLE_VALID_COUNTRIES,
            silhouette: toSvgPath(selectedFeature),
        },
    };
};
