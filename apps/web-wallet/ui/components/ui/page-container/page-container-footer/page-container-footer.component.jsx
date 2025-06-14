import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import Button from '../../button';

export default class PageContainerFooter extends Component {
  static propTypes = {
    children: PropTypes.node,
    onCancel: PropTypes.func,
    cancelText: PropTypes.string,
    cancelButtonType: PropTypes.string,
    onSubmit: PropTypes.func,
    submitText: PropTypes.string,
    disabled: PropTypes.bool,
    submitButtonType: PropTypes.string,
    hideCancel: PropTypes.bool,
    cancelProps: PropTypes.object,
    submitProps: PropTypes.object,
    buttonSizeLarge: PropTypes.bool,
    footerClassName: PropTypes.string,
    footerButtonClassName: PropTypes.string,
  };

  static contextTypes = {
    t: PropTypes.func,
  };

  render() {
    const {
      children,
      onCancel,
      cancelText,
      onSubmit,
      submitText,
      disabled,
      submitButtonType,
      cancelProps,
      submitProps,
      cancelButtonType,
      buttonSizeLarge = false,
      footerClassName,
      footerButtonClassName,
      hideCancel: hideCancelDirectly,
    } = this.props;

    const hideCancel =
      hideCancelDirectly || (cancelProps && !cancelProps.visible);
    const hideSubmit = submitProps && !submitProps.visible;

    const cancelLabel =
      cancelProps?.label || cancelText || this.context.t('cancel');
    const submitLabel =
      submitProps?.label || submitText || this.context.t('next');

    return (
      <div className={classnames('page-container__footer', footerClassName)}>
        <footer>
          {!hideCancel && (
            <Button
              type={cancelButtonType || 'secondary'}
              large={buttonSizeLarge}
              className={classnames(
                'page-container__footer-button',
                'page-container__footer-button__cancel',
                footerButtonClassName,
              )}
              onClick={(e) => onCancel(e)}
              data-testid="page-container-footer-cancel"
            >
              {cancelLabel}
            </Button>
          )}

          {!hideSubmit && (
            <Button
              type={submitButtonType || 'primary'}
              large={buttonSizeLarge}
              className={classnames(
                'page-container__footer-button',
                footerButtonClassName,
              )}
              disabled={disabled}
              onClick={(e) => onSubmit(e)}
              data-testid="page-container-footer-next"
            >
              {submitLabel}
            </Button>
          )}
        </footer>

        {children && (
          <div className="page-container__footer-secondary">{children}</div>
        )}
      </div>
    );
  }
}
