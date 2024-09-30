import { Box } from '@mui/material';
import classnames from 'classnames';
import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useRef } from 'react';

export const SelectCoinsItemDropdownCollapse = ({
  isOpen,
  children,
  onClose,
  reversed,
}) => {
  const containerRef = useRef(null);

  const handleClick = useCallback(
    (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        e && e.preventDefault();
        e && e.stopPropagation();
        onClose(e, containerRef?.current);
      }
    },
    [onClose, containerRef],
  );

  const handleKeyUp = useCallback(
    (e) => {
      if (e.key === 'Escape') {
        e && e.preventDefault();
        e && e.stopPropagation();
        onClose(e, containerRef?.current);
      }
    },
    [onClose, containerRef],
  );

  const addListener = useCallback(() => {
    document.addEventListener('click', handleClick, false);
    document.addEventListener('keyup', handleKeyUp, false);
  }, [handleClick, handleKeyUp]);

  const removeListener = useCallback(() => {
    document.removeEventListener('click', handleClick, false);
    document.removeEventListener('keyup', handleKeyUp, false);
  }, [handleClick, handleKeyUp]);

  useEffect(() => {
    if (isOpen) {
      addListener();
    } else {
      removeListener();
    }
    return () => {
      removeListener();
    };
  }, [isOpen, addListener, removeListener]);

  return (
    <Box
      className={classnames('select-coins__item__dropdown__collapse', {
        'select-coins__item__dropdown__collapse-open': isOpen,
        'select-coins__item__dropdown__collapse-reversed': reversed,
      })}
      sx={{ bgcolor: 'primary.light' }}
    >
      <div
        className="select-coins__item__dropdown__collapse-container"
        ref={containerRef}
        tabIndex="0"
      >
        {children}
      </div>
    </Box>
  );
};

SelectCoinsItemDropdownCollapse.propTypes = {
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
  reversed: PropTypes.bool,
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]),
};
