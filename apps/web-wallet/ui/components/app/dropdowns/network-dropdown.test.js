import React from 'react';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { screen } from '@testing-library/react';
import { renderWithProvider } from '../../../../test/lib/render-helpers';
import { LOCALHOST_RPC_URL } from '../../../../shared/constants/network';
import NetworkDropdown from './network-dropdown';

// Mock linea test network feature toggle
jest.mock('../../../../shared/constants/network', () => {
  const constants = jest.requireActual('../../../../shared/constants/network');
  return {
    ...constants,
    SHOULD_SHOW_LINEA_TESTNET_NETWORK: true,
  };
});

describe('Network Dropdown', () => {
  const createMockStore = configureMockStore([thunk]);

  describe('NetworkDropdown in appState in false', () => {
    const mockState = {
      metamask: {
        network: '1',
        provider: {
          type: 'test',
        },
        showTestnetMessageInDropdown: false,
        preferences: {
          showTestNetworks: true,
        },
      },
      appState: {
        settingsDropdownOpen: false,
      },
    };

    const store = createMockStore(mockState);

    beforeEach(() => {
      renderWithProvider(<NetworkDropdown />, store);
    });

    it('should not render menu dropdown when network dropdown is in false state', () => {
      const menuDropdown = screen.queryByTestId('menu-dropdown');
      expect(menuDropdown).not.toBeInTheDocument();
    });

    it('checks for network droppo class', () => {
      const networkDropdown = screen.queryByTestId('network-droppo');
      expect(networkDropdown).toBeInTheDocument();
    });
  });

  describe('NetworkDropdown in appState is true and show test networks is true', () => {
    const mockState = {
      metamask: {
        network: '1',
        provider: {
          type: 'test',
        },
        showTestnetMessageInDropdown: false,
        preferences: {
          showTestNetworks: true,
        },
        networkConfigurations: {
          networkConfigurationId1: {
            chainId: '0x1a',
            rpcUrl: 'http://localhost:7545',
          },
          networkConfigurationId2: { rpcUrl: 'http://localhost:7546' },
          networkConfigurationId3: {
            rpcUrl: LOCALHOST_RPC_URL,
            nickname: 'localhost',
          },
        },
      },
      appState: {
        settingsDropdownOpen: true,
      },
    };

    global.platform = {
      openExtensionInBrowser: jest.fn(),
    };

    const store = createMockStore(mockState);

    beforeEach(() => {
      renderWithProvider(<NetworkDropdown />, store);
    });

    it('checks background color for first ColorIndicator', () => {
      const mainnetColorIndicator = screen.queryByTestId('color-icon-mainnet');
      expect(mainnetColorIndicator).toBeInTheDocument();
    });

    it('checks background color for fourth ColorIndicator', () => {
      const goerliColorIndicator = screen.queryByTestId('color-icon-goerli');
      expect(goerliColorIndicator).toBeInTheDocument();
    });

    it('checks background color for fifth ColorIndicator', () => {
      const sepoliaColorIndicator = screen.queryByTestId('color-icon-sepolia');
      expect(sepoliaColorIndicator).toBeInTheDocument();
    });

    it('checks background color for sixth ColorIndicator', () => {
      const localhostColorIndicator = screen.queryByTestId(
        'color-icon-localhost',
      );
      expect(localhostColorIndicator).toBeInTheDocument();
    });

    it('checks background color for seventh ColorIndicator', () => {
      const lineaColorIndicator = screen.queryByTestId(
        'color-icon-lineatestnet',
      );
      expect(lineaColorIndicator).toBeInTheDocument();
    });

    it('checks that Add Network button is rendered', () => {
      const addNetworkButton = screen.queryByText('Add network');
      expect(addNetworkButton).toBeInTheDocument();
    });

    it('shows test networks in the dropdown', () => {
      const networkItems = screen.queryAllByTestId(/network-item/u);
      expect(networkItems).toHaveLength(7);
    });
  });

  describe('NetworkDropdown in appState is true and show test networks is false', () => {
    const mockState = {
      metamask: {
        network: '1',
        provider: {
          type: 'test',
        },
        showTestnetMessageInDropdown: false,
        preferences: {
          showTestNetworks: false,
        },
        networkConfigurations: {
          networkConfigurationId1: {
            chainId: '0x1a',
            rpcUrl: 'http://localhost:7545',
          },
          networkConfigurationId2: { rpcUrl: 'http://localhost:7546' },
        },
      },
      appState: {
        settingsDropdownOpen: true,
      },
    };

    global.platform = {
      openExtensionInBrowser: jest.fn(),
    };

    const store = createMockStore(mockState);

    beforeEach(() => {
      renderWithProvider(<NetworkDropdown />, store);
    });

    it('checks background color for first ColorIndicator', () => {
      const mainnetColorIndicator = screen.queryByTestId('color-icon-mainnet');
      expect(mainnetColorIndicator).toBeInTheDocument();
    });

    it('checks that Add Network button is rendered', () => {
      const addNetworkButton = screen.queryByText('Add network');
      expect(addNetworkButton).toBeInTheDocument();
    });

    it('does not show test networks in the dropdown', () => {
      const networkItems = screen.queryAllByTestId(/network-item/u);

      expect(networkItems).toHaveLength(3);
    });
  });
});
