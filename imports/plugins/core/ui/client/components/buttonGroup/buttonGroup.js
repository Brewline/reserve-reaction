import React from "react";
import PropTypes from "prop-types";
import classnames from "classnames";
import { registerComponent } from "@reactioncommerce/reaction-components";

const ButtonGroup = ({ className, children }) => {
  const baseClassName = classnames({
    "rui": true,
    "btn-group": true,
    [className]: !!className
  });

  return (
    <div className={baseClassName}>
      {children}
    </div>
  );
};

ButtonGroup.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string
};

registerComponent("ButtonGroup", ButtonGroup);

export default ButtonGroup;
