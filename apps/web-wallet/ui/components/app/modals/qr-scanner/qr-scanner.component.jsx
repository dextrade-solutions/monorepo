import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Html5Qrcode } from 'html5-qrcode';

import { SECOND } from '../../../../../shared/constants/time';
import Spinner from '../../../ui/spinner';
import WebcamUtils from '../../../../helpers/utils/webcam-utils';
import PageContainerFooter from '../../../ui/page-container/page-container-footer/page-container-footer.component';
import { isPwa } from '../../../../../shared/constants/environment';
import FileField from '../../../ui/file-field/file-field';
import { Tab, Tabs } from '../../../ui/tabs';
import { TEXT_ALIGN } from '../../../../helpers/constants/design-system';

const READY_STATE = {
  ACCESSING_CAMERA: 'ACCESSING_CAMERA',
  NEED_TO_ALLOW_ACCESS: 'NEED_TO_ALLOW_ACCESS',
  READY: 'READY',
};

const SCAN_TYPES = {
  camera: 'scanCamera',
  file: 'scanFile',
};

export default class QrScanner extends Component {
  static propTypes = {
    hideModal: PropTypes.func.isRequired,
    qrCodeDetected: PropTypes.func.isRequired,
  };

  static contextTypes = {
    t: PropTypes.func,
  };

  constructor(props) {
    super(props);

    this.state = this.getInitialState();
    this.codeReader = null;
    this.permissionChecker = null;
    this.mounted = false;

    // Clear pre-existing qr code data before scanning
    this.props.qrCodeDetected(null);

    this.video = React.createRef();
  }

  componentDidMount() {
    this.mounted = true;
    this.codeReader = new Html5Qrcode('render');
    this.checkEnvironment();
  }

  componentDidUpdate(_, prevState) {
    const { ready } = this.state;

    if (prevState.ready !== ready) {
      if (ready === READY_STATE.NEED_TO_ALLOW_ACCESS) {
        this.checkPermissions();
      } else {
        this.initCamera();
      }
    }
  }

  getInitialState() {
    return {
      ready: READY_STATE.ACCESSING_CAMERA,
      error: null,
    };
  }

  checkEnvironment = async () => {
    this.initCamera();
  };

  checkPermissions = async () => {
    try {
      const { permissions } = await WebcamUtils.checkStatus();
      if (permissions) {
        // Let the video stream load first...
        await new Promise((resolve) => setTimeout(resolve, SECOND * 2));
        if (!this.mounted) {
          return;
        }
        this.setState({ ready: READY_STATE.READY });
      } else if (this.mounted) {
        // Keep checking for permissions
        this.permissionChecker = setTimeout(this.checkPermissions, SECOND);
      }
    } catch (error) {
      if (this.mounted) {
        this.setState({ error });
      }
    }
  };

  componentWillUnmount() {
    this.mounted = false;
    clearTimeout(this.permissionChecker);
    this.teardownCodeReader();
  }

  teardownCodeReader = async () => {
    if (this.codeReader && this.codeReader.isScanning) {
      await this.codeReader.stop();
      this.codeReader.clear();
    }
  };

  scanFile = async (file) => {
    await this.teardownCodeReader();
    try {
      const result = await this.codeReader.scanFileV2(file, false);
      this.onScanSuccess(result.decodedText, result);
    } catch (err) {
      this.onScanFailure(err);
    }
  };

  onScanSuccess = (decodedText, decodedResult) => {
    // handle the scanned code as you like, for example:
    const result = this.parseContent(decodedText);
    if (result) {
      this.props.qrCodeDetected(result);
      this.stopAndClose();
    }
    console.log(`Code matched = ${decodedText}`, decodedResult);
  };

  onScanFailure = (error) => {
    // handle scan failure, usually better to ignore and keep scanning.
    // for example:
    console.warn(`Code scan error = ${error}`);
  };

  initCamera = async () => {
    if (!this.mounted) {
      return;
    }

    await this.codeReader.start(
      { facingMode: 'environment' },
      { fps: 10, aspectRatio: 1, qrbox: 200 },
      this.onScanSuccess,
      this.onScanFailure,
    );
    this.setState({ ready: READY_STATE.READY });
  };

  parseContent(content) {
    let type = 'unknown';
    let values = {};

    // Here we could add more cases
    // To parse other type of links
    // For ex. EIP-681 (https://eips.ethereum.org/EIPS/eip-681)
    // Ethereum address links - fox ex. ethereum:0x.....1111
    if (content.split('ethereum:').length > 1) {
      type = 'address';
      values = { address: content.split('ethereum:')[1] };

      // Regular ethereum addresses - fox ex. 0x.....1111
    } else if (
      !content.includes(' ') ||
      content.substring(0, 2).toLowerCase() === '0x'
    ) {
      type = 'address';
      values = { address: content };
    } else {
      type = 'mnemonic';
      values = { mnemonic: content };
    }
    return { type, values };
  }

  stopAndClose = () => {
    if (this.codeReader) {
      this.teardownCodeReader();
    }
    this.props.hideModal();
  };

  tryAgain = () => {
    clearTimeout(this.permissionChecker);
    if (this.codeReader) {
      this.teardownCodeReader();
    }
    this.setState(this.getInitialState(), () => {
      this.checkEnvironment();
    });
  };

  renderError() {
    const { t } = this.context;
    const { error } = this.state;

    let title, msg;
    if (error.type === 'NO_WEBCAM_FOUND') {
      title = t('noWebcamFoundTitle');
      msg = t('noWebcamFound');
    } else if (error.message === t('unknownQrCode')) {
      msg = t('unknownQrCode');
    } else {
      title = t('unknownCameraErrorTitle');
      msg = t('unknownCameraError');
    }

    return (
      <>
        <div className="qr-scanner__image">
          <img src="images/webcam.svg" width="70" height="70" alt="" />
        </div>
        {title ? <div className="qr-scanner__title">{title}</div> : null}
        <div className="qr-scanner__error">{msg}</div>
        <PageContainerFooter
          onCancel={this.stopAndClose}
          onSubmit={this.tryAgain}
          cancelText={t('cancel')}
          submitText={t('tryAgain')}
        />
      </>
    );
  }

  renderVideo() {
    const { t } = this.context;
    const { ready } = this.state;

    let message;
    if (ready === READY_STATE.ACCESSING_CAMERA) {
      message = t('accessingYourCamera');
    } else if (ready === READY_STATE.READY) {
      message = t('scanInstructions');
    } else if (ready === READY_STATE.NEED_TO_ALLOW_ACCESS) {
      message = t('youNeedToAllowCameraAccess');
    }

    return (
      <>
        <div className="qr-scanner__title">{t('scanQrCode')}</div>
        <div className="qr-scanner__content">
          <div className="qr-scanner__status">{message}</div>

          <Tabs
            autogrow
            onTabClick={(key) =>
              key === SCAN_TYPES.camera
                ? this.initCamera()
                : this.teardownCodeReader()
            }
          >
            <Tab tabKey="scanCamera" name="Camera scan">
              <div className="qr-scanner__content__video-wrapper">
                <div
                  ref={this.video}
                  id="render"
                  style={{
                    width: '350px',
                    transform: isPwa ? null : 'scaleX(-1)',
                    opacity: ready === READY_STATE.READY ? '1' : '0',
                  }}
                />
                {ready === READY_STATE.READY ? null : (
                  <Spinner color="var(--color-warning-default)" />
                )}
              </div>
            </Tab>
            <Tab tabKey="scanFile" name="File scan">
              <div id="render" />
              <FileField
                onChange={this.scanFile}
                boxProps={{
                  textAlign: TEXT_ALIGN.CENTER,
                  margin: 3,
                  padding: 3,
                }}
              />
            </Tab>
          </Tabs>
        </div>
      </>
    );
  }

  render() {
    const { error } = this.state;
    return (
      <div className="qr-scanner">
        <div className="qr-scanner__close" onClick={this.stopAndClose}></div>
        {error ? this.renderError() : this.renderVideo()}
      </div>
    );
  }
}
