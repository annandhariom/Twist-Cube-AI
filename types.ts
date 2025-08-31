export enum LearningMethod {
    Beginner = "Beginner's Method",
    CFOP = "CFOP (Fridrich method)",
    Roux = "Roux Method",
}

export enum Difficulty {
    Simple = "Simple",
    Advanced = "Advanced",
}

export enum View {
    Selection = "SELECTION",
    Learning = "LEARNING",
    Camera = "CAMERA",
}

export interface ContentBlock {
  type: 'h2' | 'h3' | 'p' | 'algorithm';
  content: string;
}
