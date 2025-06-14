import React from 'react';
import { fireEvent } from '@testing-library/react';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import mockState from '../../../../test/data/mock-state.json';
import { renderWithProvider } from '../../../../test/lib/render-helpers';
import AppHeader from '.';

const mockShowNetworkDropdown = jest.fn();
const mockHideNetworkDropdown = jest.fn();
const mockToggleAccountMenu = jest.fn();

jest.mock('../../../store/actions', () => {
  return {
    showSettingsDropdown: () => mockShowNetworkDropdown,
    hideSettingsDropdown: () => mockHideNetworkDropdown,
    toggleAccountMenu: () => mockToggleAccountMenu,
  };
});

describe('App Header', () => {
  afterEach(() => {
    mockShowNetworkDropdown.mockClear();
    mockHideNetworkDropdown.mockClear();
    mockToggleAccountMenu.mockClear();
  });

  const store = configureMockStore([thunk])(mockState);

  it('should match snapshot', () => {
    const { container } = renderWithProvider(<AppHeader />, store);
    expect(container).toMatchSnapshot();
  });

  describe('App Header Logo', () => {
    it('routes to default route when logo is clicked', () => {
      const { history, queryByTestId } = renderWithProvider(
        <AppHeader />,
        store,
        '/different-route',
      );
      expect(history.location.pathname).toStrictEqual('/different-route');

      const appLogo = queryByTestId('app-header-logo');
      fireEvent.click(appLogo);

      expect(history.location.pathname).toStrictEqual('/');
    });
  });

  describe('Network', () => {
    it('shows network dropdown when settingsDropdownOpen is false', () => {
      const { queryByTestId } = renderWithProvider(<AppHeader />, store);

      const networkDisplay = queryByTestId('network-display');

      fireEvent.click(networkDisplay);

      expect(mockShowNetworkDropdown).toHaveBeenCalled();
      expect(mockHideNetworkDropdown).not.toHaveBeenCalled();
    });

    it('hides network dropdown when settingsDropdownOpen is true', () => {
      const openNetworkDropdownState = {
        ...mockState,
        appState: {
          settingsDropdownOpen: true,
        },
      };

      const openNetworkDropdownStore = configureMockStore([thunk])(
        openNetworkDropdownState,
      );

      const { queryByTestId } = renderWithProvider(
        <AppHeader />,
        openNetworkDropdownStore,
      );

      const networkDisplay = queryByTestId('network-display');

      fireEvent.click(networkDisplay);

      expect(mockShowNetworkDropdown).not.toHaveBeenCalled();
      expect(mockHideNetworkDropdown).toHaveBeenCalled();
    });

    it('hides network indicator', () => {
      const props = {
        hideNetworkIndicator: true,
      };

      const { queryByTestId } = renderWithProvider(
        <AppHeader {...props} />,
        store,
      );

      const networkDisplay = queryByTestId('network-display');

      expect(networkDisplay).not.toBeInTheDocument();
    });
  });

  describe('Account Menu', () => {
    it('toggles account menu', () => {
      const { queryByTestId } = renderWithProvider(<AppHeader />, store);

      const accountMenuIcon = queryByTestId('account-menu-icon');

      fireEvent.click(accountMenuIcon);
      expect(mockToggleAccountMenu).toHaveBeenCalled();
    });

    it('should not render account menu icon if isUnlocked is false', () => {
      const lockedState = {
        ...mockState,
        metamask: {
          ...mockState.metamask,
          isUnlocked: false,
        },
      };

      const lockedStore = configureMockStore([thunk])(lockedState);

      const { queryByTestId } = renderWithProvider(<AppHeader />, lockedStore);

      const accountMenuIcon = queryByTestId('account-menu-icon');

      expect(accountMenuIcon).not.toBeInTheDocument();
    });

    it('does not toggle account menu when disabled', () => {
      const props = {
        disabled: true,
      };

      const { queryByTestId } = renderWithProvider(
        <AppHeader {...props} />,
        store,
      );

      const accountMenuIcon = queryByTestId('account-menu-icon');

      fireEvent.click(accountMenuIcon);
      expect(mockToggleAccountMenu).not.toHaveBeenCalled();
    });
  });

  describe('App Header Desktop dev mode Logo', () => {
    const tempDebug = process.env.METAMASK_DEBUG;

    beforeEach(() => {
      process.env.METAMASK_DEBUG = true;
    });

    afterEach(() => {
      process.env.METAMASK_DEBUG = tempDebug;
    });

    it('displays desktop icon when in dev mode', () => {
      const desktopEnabledState = {
        ...mockState,
        metamask: {
          ...mockState.metamask,
          desktopEnabled: true,
        },
      };

      const desktopEnabledStore = configureMockStore([thunk])(
        desktopEnabledState,
      );
      const { queryByTestId } = renderWithProvider(
        <AppHeader />,
        desktopEnabledStore,
      );

      const desktopDevLogo = queryByTestId('app-header-desktop-dev-logo');

      expect(desktopDevLogo).not.toBeNull();
    });
  });
});
