import { Colors } from "@/assets/scripts/OpenChart/ThemeLoader";

/**
 * Represents themes for the Presentation visualization.
 */
export abstract class PresentationTheme {
    abstract readonly edgeColor: string;
    abstract readonly arrowColor: string;
    abstract readonly actionFill: string;
    abstract readonly conditionFill: string;
    abstract readonly operatorFill: string;
    abstract readonly actionStroke: string;
    abstract readonly conditionStroke: string;
    abstract readonly operatorStroke: string;
    abstract readonly actionPropertiesStroke: string;
    abstract readonly conditionPropertiesStroke: string;
    abstract readonly textColor: string;
    abstract readonly propertiesFill: string;
    abstract readonly conditionBadgeFill: string;
    abstract readonly conditionBadgeFontColor: string;
}

class LightColorfulTheme extends PresentationTheme {
    edgeColor = Colors.LightThemeBlue.stroke_color;
    arrowColor = Colors.LightThemeBlue.stroke_color;
    actionFill = Colors.LightThemeBlue.fill_color;
    conditionFill = Colors.LightThemeGreen.fill_color;
    operatorFill = Colors.LightThemeRed.fill_color;
    actionStroke = Colors.LightThemeBlue.stroke_color;
    conditionStroke = Colors.LightThemeGreen.stroke_color;
    operatorStroke = Colors.LightThemeRed.stroke_color;
    actionPropertiesStroke = this.actionStroke;
    conditionPropertiesStroke = this.conditionStroke;
    textColor = "#FFFFFF";
    propertiesFill = "#FFFFFF";
    conditionBadgeFill = "#FFFFFF";
    conditionBadgeFontColor = this.conditionStroke;
}

class DarkColorfulTheme extends PresentationTheme {
    edgeColor = Colors.DarkThemeBlue.stroke_color;
    arrowColor = Colors.DarkThemeBlue.stroke_color;
    actionFill = Colors.DarkThemeBlue.fill_color;
    conditionFill = Colors.DarkThemeGreen.fill_color;
    operatorFill = Colors.DarkThemeRed.fill_color;
    actionStroke = Colors.DarkThemeBlue.stroke_color;
    conditionStroke = Colors.DarkThemeGreen.stroke_color;
    operatorStroke = Colors.DarkThemeRed.stroke_color;
    actionPropertiesStroke = "#444444";
    conditionPropertiesStroke = this.actionPropertiesStroke;
    textColor = "#FFFFFF";
    propertiesFill = "#333333";
    conditionBadgeFill = "#FFFFFF";
    conditionBadgeFontColor = this.conditionStroke;
}

class DarkGrayscaleTheme extends PresentationTheme {
    edgeColor = "#777777";
    arrowColor = this.edgeColor;
    actionFill = "#444444";
    conditionFill = this.actionFill;
    operatorFill = this.actionFill;
    actionStroke = this.edgeColor;
    conditionStroke = this.actionStroke;
    operatorStroke = this.actionStroke;
    actionPropertiesStroke = this.actionStroke;
    conditionPropertiesStroke = this.conditionStroke;
    textColor = "#FFFFFF";
    propertiesFill = "#555555";
    conditionBadgeFill = this.propertiesFill;
    conditionBadgeFontColor = this.textColor;
}

class LightGrayscaleTheme extends PresentationTheme {
    edgeColor = "#aaaaaa";
    arrowColor = this.edgeColor;
    actionFill = "#cccccc";
    conditionFill = this.actionFill;
    operatorFill = this.actionFill;
    actionStroke = this.edgeColor;
    conditionStroke = this.actionStroke;
    operatorStroke = this.actionStroke;
    actionPropertiesStroke = this.actionStroke;
    conditionPropertiesStroke = this.conditionStroke;
    textColor = "#000000";
    propertiesFill = "#e5e5e5";
    conditionBadgeFill = this.propertiesFill;
    conditionBadgeFontColor = this.textColor;
}

export const lightGrayscaleTheme = new LightGrayscaleTheme();
export const  darkGrayscaleTheme = new DarkGrayscaleTheme();
export const lightColorfulTheme = new LightColorfulTheme();
export const darkColorfulTheme = new DarkColorfulTheme();
