import React, { Fragment } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { i18next } from "/client/api";
import { compose, withState } from "recompose";
import withStyles from "@material-ui/core/styles/withStyles";
import IconButton from "@material-ui/core/IconButton";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import Typography from "@material-ui/core/Typography";
import ChevronRight from "mdi-material-ui/ChevronRight";
import DotsHorizontalCircleIcon from "mdi-material-ui/DotsHorizontalCircle";
import ConfirmDialog from "/imports/client/ui/components/ConfirmDialog";

const styles = (theme) => ({
  root: {
    paddingTop: theme.spacing.unit * 2,
    paddingBottom: theme.spacing.unit * 4
  },
  breadcrumbs: {
    display: "flex",
    alignItems: "center",
    marginBottom: theme.spacing.unit * 2
  },
  breadcrumbIcon: {
    fontSize: 14
  },
  breadcrumbLink: {
    fontSize: "14px",
    fontFamily: theme.typography.fontFamily,
    color: "#3c3c3c",
    border: 0,
    textDecoration: "underline",
    margin: "0 7px"
  },
  statusbar: {
    display: "flex",
    alignItems: "center"
  }
});

/**
 * Header component for various product admin forms
 * @param {Object} props Component props
 * @returns {Node} React component
 */
function ProductHeader(props) {
  const {
    classes,
    product,
    variant,
    onArchiveProduct,
    onCloneProduct,
    onCloneVariant,
    onRestoreProduct,
    onVisibilityChange,
    option,
    setMenuAnchorEl,
    menuAnchorEl
  } = props;

  if (!product) {
    return null;
  }

  const currentProduct = option || variant || product;

  // Archive menu item
  let archiveMenuItem = (
    <ConfirmDialog
      title={i18next.t("admin.productTable.bulkActions.archiveTitle")}
      message={i18next.t("productDetailEdit.archiveThisProduct")}
      onConfirm={() => {
        let redirectUrl = "/operator/products";

        if (option) {
          redirectUrl = `/operator/products/${product._id}/${variant._id}`;
        } else if (variant) {
          redirectUrl = `/operator/products/${product._id}`;
        } else {
          redirectUrl = "/operator/products";
        }

        onArchiveProduct(currentProduct, redirectUrl);
      }}
    >
      {({ openDialog }) => (
        <MenuItem onClick={openDialog}>{i18next.t("admin.productTable.bulkActions.archive")}</MenuItem>
      )}
    </ConfirmDialog>
  );

  if (currentProduct.isDeleted) {
    archiveMenuItem = (
      <ConfirmDialog
        title={i18next.t("admin.productTable.bulkActions.restoreTitle")}
        message={i18next.t("productDetailEdit.restoreThisProduct")}
        onConfirm={() => {
          onRestoreProduct(currentProduct);
          setMenuAnchorEl(null);
        }}
      >
        {({ openDialog }) => (
          <MenuItem onClick={openDialog}>{i18next.t("admin.productTable.bulkActions.restore")}</MenuItem>
        )}
      </ConfirmDialog>
    );
  }

  return (
    <div className={classes.root}>
      <div className={classes.breadcrumbs}>
        <Link className={classes.breadcrumbLink} to="/operator/products">{"Products"}</Link>
        <ChevronRight className={classes.breadcrumbIcon} />
        <Link className={classes.breadcrumbLink} to={`/operator/products/${product._id}`}>
          {product.title || "Untitled Product"}
        </Link>
        {variant && (
          <Fragment>
            <ChevronRight className={classes.breadcrumbIcon} />
            <Link
              className={classes.breadcrumbLink}
              to={`/operator/products/${product._id}/${variant._id}`}
            >
              {variant.title || "Untitled Variant"}
            </Link>
          </Fragment>
        )}
        {option && (
          <Fragment>
            <ChevronRight className={classes.breadcrumbIcon} />
            <Link
              className={classes.breadcrumbLink}
              to={`/operator/products/${product._id}/${variant._id}/${option._id}`}
            >
              {option.title || "Untitled Option"}
            </Link>
          </Fragment>
        )}
      </div>
      <Typography variant="h2">
        {
          (option && (option.title || "Untitled Option")) ||
          (variant && (variant.title || "Untitled Variant")) ||
          (product && (product.title || "Untitled Product"))
        }
        {(currentProduct.isDeleted) && `(${i18next.t("app.archived")})`}
      </Typography>
      <div className={classes.statusbar}>

        <Typography>
          {currentProduct.isVisible ? "Visible" : "Hidden"}
          {currentProduct.isDeleted ? i18next.t("app.archived") : null}
        </Typography>

        <IconButton
          onClick={(event) => {
            setMenuAnchorEl(event.currentTarget);
          }}
        >
          <DotsHorizontalCircleIcon />
        </IconButton>

        <Menu
          id="bulk-actions-menu"
          anchorEl={menuAnchorEl}
          open={Boolean(menuAnchorEl)}
          onClose={() => setMenuAnchorEl(null)}
        >
          <MenuItem
            onClick={() => {
              onVisibilityChange(currentProduct);
              setMenuAnchorEl(null);
            }}
          >
            {currentProduct.isVisible ?
              i18next.t("admin.productTable.bulkActions.makeHidden") :
              i18next.t("admin.productTable.bulkActions.makeVisible")
            }
          </MenuItem>
          <MenuItem
            onClick={() => {
              if (product && option) {
                // Clone option
                onCloneVariant(product._id, option._id);
              } else if (product && variant) {
                // Clone variant
                onCloneVariant(product._id, variant._id);
              } else {
                // Clone product
                onCloneProduct(product._id);
              }

              setMenuAnchorEl(null);
            }}
          >
            {i18next.t("admin.productTable.bulkActions.duplicate")}
          </MenuItem>
          {archiveMenuItem}
        </Menu>

      </div>
    </div>
  );
}

ProductHeader.propTypes = {
  classes: PropTypes.object,
  menuAnchorEl: PropTypes.any,
  onArchiveProduct: PropTypes.func,
  onCloneProduct: PropTypes.func,
  onCloneVariant: PropTypes.func,
  onRestoreProduct: PropTypes.func,
  onVisibilityChange: PropTypes.func,
  option: PropTypes.object,
  product: PropTypes.object,
  setMenuAnchorEl: PropTypes.func.isRequired,
  variant: PropTypes.object
};

ProductHeader.defaultProps = {
  onRemoveVariant() {},
  CloneProduct() {},
  onCloneVariant() {},
  onRestoreProduct() {},
  onVisibilityChange() {}
};

export default compose(
  withState("menuAnchorEl", "setMenuAnchorEl", null),
  withStyles(styles, { name: "RuiProductHeader" })
)(ProductHeader);
