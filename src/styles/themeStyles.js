// src/styles/themeStyles.js
import { StyleSheet, Platform } from 'react-native';

export const getThemedStyles = (theme) => {
  const shadow = (elevation = 4) => Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: elevation },
      shadowOpacity: 0.25,
      shadowRadius: elevation,
    },
    android: { elevation },
  });

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    scrollContainer: {
      flexGrow: 1,
      padding: 16,
      backgroundColor: theme.colors.background,
    },

    /* ─── Cards & Sections ─── */
    card: {
      backgroundColor: theme.dark ? '#1e1e1e' : '#fefefe',
      borderRadius: 10,
      padding: 16,
      marginBottom: 16,
      ...shadow(3),
    },
    section: {
      backgroundColor: theme.dark ? '#1e1e1e' : '#f9f9f9',
      borderRadius: 10,
      padding: 16,
      marginBottom: 16,
      ...shadow(1),
    },

    /* ─── Text & Headers ─── */
    headerText: {
      fontSize: 24,
      fontWeight: '700',
      color: theme.colors.primary,
    },
    subHeaderText: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.text,
    },
    label: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 4,
    },
    bodyText: {
      fontSize: 14,
      color: theme.colors.text,
    },
    linkText: {
      fontSize: 14,
      color: theme.colors.primary,
      fontWeight: '600',
    },
    smallText: {
      fontSize: 13,
      color: theme.colors.border,
    },

    /* ─── Input & Form ─── */
    input: {
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 6,
      backgroundColor: theme.dark ? '#2a2a2a' : '#f2f2f2',
      color: theme.colors.text,
      paddingVertical: 10,
      paddingHorizontal: 12,
      fontSize: 14,
      marginBottom: 10,
    },
    inputLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 4,
    },
    dateInput: {
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 6,
      paddingVertical: 10,
      paddingHorizontal: 14,
      justifyContent: 'center',
      marginBottom: 10,
      backgroundColor: theme.dark ? '#2a2a2a' : '#f2f2f2',
    },

    /* ─── Row Layouts ─── */
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    toggleRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 12,
    },

    /* ─── Divider ─── */
    divider: {
      height: 1,
      backgroundColor: theme.colors.border,
      marginVertical: 12,
    },

    /* ─── Buttons ─── */
    button: {
      backgroundColor: theme.colors.primary,
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 6,
      alignItems: 'center',
    },
    buttonText: {
      color: '#fff',
      fontSize: 14,
      fontWeight: '600',
    },
    buttonDanger: {
      backgroundColor: '#ff453a',
    },
    buttonSecondary: {
      backgroundColor: theme.colors.card,
      borderColor: theme.colors.primary,
      borderWidth: 1,
    },
    modalFooter: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      gap: 12,
      marginTop: 16,
    },

    /* ─── Modal ─── */
    modalOverlay: {
      flex: 1,
      backgroundColor: '#00000088',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 16,
    },
    modalContent: {
      width: '100%',
      maxHeight: '85%',
      backgroundColor: theme.colors.card,
      borderRadius: 12,
      padding: 20,
      ...shadow(5),
    },
    modalHeader: {
      fontSize: 20,
      fontWeight: '700',
      color: theme.colors.primary,
      marginBottom: 12,
    },

    /* ─── Overlay Toast ─── */
    overlay: {
      position: 'absolute',
      top: 40,
      left: 0,
      right: 0,
      paddingHorizontal: 16,
      alignItems: 'center',
    },
    overlayContent: {
      backgroundColor: theme.colors.primary,
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 20,
      flexDirection: 'row',
      gap: 10,
      alignItems: 'center',
    },
    overlayText: {
      color: '#fff',
      fontSize: 14,
      fontWeight: '600',
    },
  });
};
