import React, { useContext, useMemo, useRef, useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { getCurrentLocale } from '../../../ducks/locale/locale';
import { I18nContext } from '../../../contexts/i18n';
import { useEqualityCheck } from '../../../hooks/useEqualityCheck';
import Button from '../../ui/button';
import Popover from '../../ui/popover';
import { Text } from '../../component-library';
import { updateViewedNotifications } from '../../../store/actions';
import { getTranslatedUINotifications } from '../../../../shared/notifications';
import { getSortedAnnouncementsToShow } from '../../../selectors';
import { TextVariant } from '../../../helpers/constants/design-system';
import { NETWORKS_ROUTE } from '../../../helpers/constants/routes';

function getActionFunctionById(id, history) {
  const actionFunctions = {
    18: () => {
      updateViewedNotifications({ 18: true });
      history.push(NETWORKS_ROUTE);
    },
  };

  return actionFunctions[id];
}

const renderDescription = (description) => {
  if (!Array.isArray(description)) {
    return <Text variant={TextVariant.bodyMd}>{description}</Text>;
  }

  return (
    <>
      {description.map((piece, index) => {
        const isLast = index === description.length - 1;
        return (
          <Text
            key={`item-${index}`}
            variant={TextVariant.bodyMd}
            marginBottom={isLast ? 0 : 4}
          >
            {piece}
          </Text>
        );
      })}
    </>
  );
};

const renderFirstNotification = (notification, idRefMap, history, isLast) => {
  const { id, date, title, description, image, actionText } = notification;
  const actionFunction = getActionFunctionById(id, history);
  const imageComponent = image && (
    <img
      className="whats-new-popup__notification-image"
      src={image.src}
      height={image.height}
      width={image.width}
    />
  );
  const placeImageBelowDescription = image?.placeImageBelowDescription;
  return (
    <div
      className={classnames(
        'whats-new-popup__notification whats-new-popup__first-notification',
        {
          'whats-new-popup__last-notification': isLast,
        },
      )}
      key={`whats-new-popop-notification-${id}`}
    >
      <Text variant={TextVariant.bodyLgMedium} marginBottom={2}>
        {title}
      </Text>
      {!placeImageBelowDescription && imageComponent}
      <div className="whats-new-popup__description-and-date">
        <div className="whats-new-popup__notification-description">
          {renderDescription(description)}
        </div>
        <div className="whats-new-popup__notification-date">{date}</div>
      </div>
      {placeImageBelowDescription && imageComponent}
      {actionText && (
        <Button
          type="primary"
          className="whats-new-popup__button"
          onClick={actionFunction}
        >
          {actionText}
        </Button>
      )}
      <div
        className="whats-new-popup__intersection-observable"
        ref={idRefMap[id]}
      />
    </div>
  );
};

const renderSubsequentNotification = (
  notification,
  idRefMap,
  history,
  isLast,
) => {
  const { id, date, title, description, actionText } = notification;

  const actionFunction = getActionFunctionById(id, history);
  return (
    <div
      className={classnames('whats-new-popup__notification', {
        'whats-new-popup__last-notification': isLast,
      })}
      key={`whats-new-popop-notification-${id}`}
    >
      <div className="whats-new-popup__notification-title">{title}</div>
      <div className="whats-new-popup__description-and-date">
        <div className="whats-new-popup__notification-description">
          {renderDescription(description)}
        </div>
        <div className="whats-new-popup__notification-date">{date}</div>
      </div>
      {actionText && (
        <div className="whats-new-popup__link" onClick={actionFunction}>
          {`${actionText} >`}
        </div>
      )}
      <div
        className="whats-new-popup__intersection-observable"
        ref={idRefMap[id]}
      />
    </div>
  );
};

export default function WhatsNewPopup({ onClose }) {
  const t = useContext(I18nContext);
  const history = useHistory();

  const notifications = useSelector(getSortedAnnouncementsToShow);
  const locale = useSelector(getCurrentLocale);

  const [seenNotifications, setSeenNotifications] = useState({});
  const [shouldShowScrollButton, setShouldShowScrollButton] = useState(true);

  const popoverRef = useRef();

  const memoizedNotifications = useEqualityCheck(notifications);
  const idRefMap = useMemo(
    () =>
      memoizedNotifications.reduce(
        (_idRefMap, notification) => ({
          ..._idRefMap,
          [notification.id]: React.createRef(),
        }),
        {},
      ),
    [memoizedNotifications],
  );

  const handleScrollDownClick = (e) => {
    e.stopPropagation();
    idRefMap[notifications[notifications.length - 1].id].current.scrollIntoView(
      {
        behavior: 'smooth',
      },
    );
    setShouldShowScrollButton(false);
  };
  useEffect(() => {
    const observer = new window.IntersectionObserver(
      (entries, _observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const [id, ref] = Object.entries(idRefMap).find(([_, _ref]) =>
              _ref.current.isSameNode(entry.target),
            );

            setSeenNotifications((_seenNotifications) => ({
              ..._seenNotifications,
              [id]: true,
            }));

            _observer.unobserve(ref.current);
          }
        });
      },
      {
        root: popoverRef.current,
        threshold: 1.0,
      },
    );

    Object.values(idRefMap).forEach((ref) => {
      observer.observe(ref.current);
    });

    return () => {
      observer.disconnect();
    };
  }, [idRefMap, setSeenNotifications]);

  return (
    <Popover
      title={t('whatsNew')}
      headerProps={{ padding: [4, 4, 4] }}
      className="whats-new-popup__popover"
      onClose={() => {
        updateViewedNotifications(seenNotifications);
        onClose();
      }}
      popoverRef={popoverRef}
      showScrollDown={shouldShowScrollButton && notifications.length > 1}
      onScrollDownButtonClick={handleScrollDownClick}
    >
      <div className="whats-new-popup__notifications">
        {notifications.map(({ id }, index) => {
          const notification = getTranslatedUINotifications(t, locale)[id];
          const isLast = index === notifications.length - 1;
          // Display the swaps notification with full image
          // Displays the NFTs & OpenSea notifications 16,17 with full image
          return index === 0
            ? renderFirstNotification(notification, idRefMap, history, isLast)
            : renderSubsequentNotification(
                notification,
                idRefMap,
                history,
                isLast,
              );
        })}
      </div>
    </Popover>
  );
}

WhatsNewPopup.propTypes = {
  onClose: PropTypes.func.isRequired,
};
