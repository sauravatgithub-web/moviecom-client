import { createTheme } from '@mui/material/styles';

export const orange = "#d73e41";
export const greyColor = "rgb(240, 135, 137, 0.2)"
export const lightBlue = "#2649ab"

export const purple = "rgba(75, 192, 192, 1)"
export const purpleLight = "rgba(75, 192, 192, 0.2)"

export const blueGradientNear = "rgba(200, 200, 200, 0.5)";
export const blueGradientFar = "rgba(92, 80, 227, 0.5)";

export const headerDialogColor = "#e3f2fd";
export const chatListColor = "#3456b3";
export const hoverChatColor = "#4864ae";
export const profileColor = "#90caf9";
export const chatThemeColor = "#e3f2fd";

export const callBackgroundColor = "#17162a"
export const endCallColor = "#f50057";

export const deleteIconColor = "#f14e4e";
export const borderBlueColor = "#3838ef";

export const buttonBackgroundColor = "#383c61";

export const theme = createTheme({
    palette: {
        primary: {
            light: '#757ce8',
            main: '#3f50b5',
            dark: '#002884',
            contrastText: '#fff',
        },
        secondary: {
            light: '#ff7961',
            main: '#f44336',
            dark: '#ba000d',
            contrastText: '#000',
        },
        text: {
            primary: '#000',
            secondary: '#000',
        },
        error: {
            main: '#ff7961',
        },
        warning: {
            main: '#ff7961',
        },
        success: {
            main: '#ff7961',
        },
        custom: {
            primary: '#FF5722', // Custom primary color
            secondary: '#FFEB3B', // Custom secondary color
        },
    },
});
