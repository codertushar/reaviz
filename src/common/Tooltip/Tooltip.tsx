import React, { Component } from 'react';
import classNames from 'classnames';
import bind from 'memoize-bind';
import {
  Placement,
  ReferenceObject,
  ConnectedOverlay,
  TriggerTypes
} from 'rdk';
import css from './Tooltip.module.scss';
import { motion } from 'framer-motion';

const tooltips: Tooltip[] = [];

export interface TooltipProps {
  /**
   * Content for the tooltip.
   */
  content: any;

  /**
   * Reference of the tooltip to align to.
   */
  reference?: ReferenceObject | HTMLElement | any;

  /**
   * Popperjs placement.
   */
  placement: Placement;

  /**
   * Delay before showing tooltip.
   */
  enterDelay: number;

  /**
   * Delay before closing tooltip.
   */
  leaveDelay: number;

  /**
   * Popperjs modifiers.
   */
  modifiers?: any;

  /**
   * External setter for visibility.
   */
  visible: boolean;

  /**
   * Additiona CSS classnames.
   */
  className?: any;

  /**
   * How the tooltip will be triggered.
   */
  trigger: TriggerTypes[] | TriggerTypes;

  /**
   * Whether the tooltip is disabled.
   */
  disabled?: boolean;

  /**
   * Whether the tooltip should move with the cursor or not.
   */
  followCursor?: boolean;
}

interface TooltipState {
  visible: boolean;
}

export class Tooltip extends Component<TooltipProps, TooltipState> {
  static defaultProps: Partial<TooltipProps> = {
    enterDelay: 0,
    leaveDelay: 200,
    placement: 'top',
    trigger: 'hover',
    visible: false,
    followCursor: false
  };

  timeout: any;

  state: TooltipState = {
    visible: this.props.visible
  };

  componentDidUpdate(prevProps: TooltipProps) {
    const { visible } = this.props;

    if (visible !== prevProps.visible && visible !== this.state.visible) {
      if (visible) {
        this.activate();
      } else {
        this.deactivate();
      }
    }
  }

  componentWillUnmount() {
    this.deactivate();
  }

  onActivate() {
    if (!this.state.visible) {
      this.deactivateAll();
      clearTimeout(this.timeout);
      this.timeout = setTimeout(() => this.activate(), this.props.enterDelay);
    }
  }

  onDeactivate() {
    clearTimeout(this.timeout);
    this.timeout = setTimeout(() => this.deactivate(), this.props.leaveDelay);
  }

  activate() {
    if (!this.props.disabled) {
      this.setState({ visible: true });
      tooltips.push(this);
    }
  }

  deactivate() {
    const idx = tooltips.indexOf(this);
    if (idx > -1) {
      this.setState({ visible: false });
      tooltips.splice(idx, 1);
    }
  }

  deactivateAll() {
    tooltips.forEach(t => t.deactivate());
  }

  renderContent = () => {
    const { content, className } = this.props;
    const children = typeof content === 'function' ? content() : content;

    if (!children) {
      return null;
    }

    return (
      <motion.div
        className={classNames(css.tooltip, className)}
        initial={{ opacity: 0, scale: 0.3 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.3 }}
      >
        {children}
      </motion.div>
    );
  };

  render() {
    const { children, content, className, visible, ...rest } = this.props;

    return (
      <ConnectedOverlay
        {...rest}
        visible={this.state.visible}
        content={this.renderContent}
        closeOnBodyClick={false}
        closeOnEscape={false}
        onActivate={bind(this.onActivate, this)}
        onDeactivate={bind(this.onDeactivate, this)}
      >
        {children}
      </ConnectedOverlay>
    );
  }
}
