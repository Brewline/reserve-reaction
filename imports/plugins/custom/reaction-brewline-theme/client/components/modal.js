import React, { Component } from "react";
import PropTypes from "prop-types";
import Random from "@reactioncommerce/random";

export default class Modal extends Component {
  static propTypes = {
    children: PropTypes.oneOfType([
      PropTypes.node,
      PropTypes.arrayOf(PropTypes.node)
    ]).isRequired,
    isOpen: PropTypes.bool,
    onRequestClose: PropTypes.func,
    size: PropTypes.oneOf(["sm", "md", "lg"]),
    uniqueId: PropTypes.string
  };

  static defaultProps = {
    isOpen: false,
    get uniqueId() { return Random.id(); }
  };

  handleRequestClose = (e) => {
    const { onRequestClose } = this.props;

    if (!onRequestClose) { return; }

    onRequestClose(e);
  }

  preventOnRequestClose = (e) => {
    e.stopPropagation();
  };

  render() {
    let modalDialogClassName = "modal-dialog";
    const { children, onRequestClose, isOpen, size, uniqueId } = this.props;

    if (!isOpen) { return null; }

    if (size) {
      modalDialogClassName += ` modal-${size}`;
    }

    return (
      <div>
        <div
          className="modal-backdrop fade in"
          id={`modal-backdrop-${uniqueId}`}
        />

        <div
          className="modal fade in"
          id={`modal-${uniqueId}`}
          style={{ display: "block" }}
          aria-label="Close"
          onClick={this.handleRequestClose}
        >
          <div className={modalDialogClassName}>
            <div
              className="modal-content"
              aria-label="Do Not Close"
              onClick={this.preventOnRequestClose}
            >
              {onRequestClose && (
                <button
                  type="button"
                  className="modal-close close"
                  aria-label="Close"
                  onClick={this.handleRequestClose}
                >
                  <span aria-hidden="true">&times;</span>
                </button>
              )}

              {children}
            </div>
          </div>
        </div>
      </div>
    );
  }
}
