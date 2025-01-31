export interface NoiseType {
  name: string;
  color: string;
  soundFile?: number;
  icon?: string;
  iconFamily?:
    | "Ionicons"
    | "MaterialCommunityIcons"
    | "FontAwesome6"
    | "FontAwesome5";
  iconColor?: string;
  proAccess?: boolean;
}

interface NoiseGroupType {
  title: string;
  noises: NoiseType[];
}

export const noiseGroups: NoiseGroupType[] = [
  {
    title: "Sleep Aid & Anxiety",
    noises: [
      {
        name: "White Noise",
        color: "#FFFFFF",
        soundFile: require("../assets/noises/white.mp3"),
        proAccess: true,
      },
      {
        name: "Pink Noise",
        color: "#FFB6C1",
        soundFile: require("../assets/noises/pink.mp3"),
        proAccess: true,
      },
      {
        name: "Brown Noise",
        color: "#AB4B07",
        soundFile: require("../assets/noises/brown.mp3"),
        proAccess: true,
      },
    ],
  },
  {
    title: "Stress Management",
    noises: [
      {
        name: "Green Noise",
        color: "#00FF00",
        soundFile: require("../assets/noises/green.mp3"),
        proAccess: false,
      },
      {
        name: "Nature Sound",
        color: "#FFFFFF",
        icon: "leaf",
        iconFamily: "Ionicons",
        iconColor: "black",
        soundFile: require("../assets/noises/stress-nature.mp3"),
        proAccess: false,
      },
      {
        name: "Relaxing Noise",
        color: "#FFFFFF",
        icon: "bee-flower",
        iconFamily: "MaterialCommunityIcons",
        iconColor: "black",
        soundFile: require("../assets/noises/stress-relaxing.mp3"),
        proAccess: false,
      },
    ],
  },
  {
    title: "Tinnitus Relief",
    noises: [
      {
        name: "Blue Noise",
        color: "#0000FF",
        soundFile: require("../assets/noises/blue.mp3"),
        proAccess: false,
      },
      {
        name: "Purple Noise",
        color: "#9400D3",
        soundFile: require("../assets/noises/purple.mp3"),
        proAccess: false,
      },
      {
        name: "Tinnitus Noise",
        color: "#FFFFFF",
        icon: "ear-listen",
        iconFamily: "FontAwesome6",
        iconColor: "black",
        soundFile: require("../assets/noises/tinnitus-silk.mp3"),
        proAccess: false,
      },
    ],
  },
  {
    title: "Focus & Productivity",
    noises: [
      {
        name: "40hz Binaural Beats",
        color: "#FFFFFF",
        icon: "hand-holding-water",
        iconFamily: "FontAwesome5",
        iconColor: "black",
        soundFile: require("../assets/noises/focus-40hz.mp3"),
        proAccess: false,
      },
      {
        name: "Fosus & Memory Sound",
        color: "#FFFFFF",
        icon: "brain",
        iconFamily: "FontAwesome5",
        iconColor: "black",
        soundFile: require("../assets/noises/focus-quantum.mp3"),
        proAccess: false,
      },
      {
        name: "Universe Sound",
        color: "#FFFFFF",
        icon: "cloud",
        iconFamily: "FontAwesome5",
        iconColor: "black",
        soundFile: require("../assets/noises/focus-universe.mp3"),
        proAccess: false,
      },
    ],
  },
];
