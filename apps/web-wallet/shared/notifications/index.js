// Messages and descriptions for these locale keys are in app/_locales/en/messages.json
export const UI_NOTIFICATIONS = {
  18: {
    id: 18,
    date: null,
    image: {
      src: 'images/logo/desktop.svg',
      width: '100%',
    },
  },
};

export const getTranslatedUINotifications = (t, locale) => {
  const formattedLocale = locale.replace('_', '-');
  return {
    18: {
      ...UI_NOTIFICATIONS[18],
      title: t('notifications18Title'),
      description: [t('notifications18DescriptionOne')],
      actionText: t('notifications18ActionText'),
      date: UI_NOTIFICATIONS[18].date
        ? new Intl.DateTimeFormat(formattedLocale).format(
            new Date(UI_NOTIFICATIONS[18].date),
          )
        : '',
    },
  };
};
