import { Link } from "@reach/router";
import classNames from "classnames";
import PageDivider from "components/PageDivider";
import { ProgressLevels } from "constants/";
import React, { useState } from "react";
import ArrowIcon from "../../../../assets/images/icon-arrow.svg";
import "./styles.module.scss";

/**
 * Review Table Component
 */
const ReviewTable = ({ formData, enableEdit = true }) => {
  const [steps, setSteps] = useState([
    { id: 0, label: "Basic Info", value: "basicInfo", isOpen: false },
    { id: 1, label: "Website Purpose", value: "websitePurpose", isOpen: false },
    { id: 2, label: "Page Details", value: "pageDetails", isOpen: false },
    { id: 3, label: "Branding", value: "branding", isOpen: false },
  ]);

  const setStepToggler = (id) => {
    const newSteps = steps.map((item) =>
      item.id === id ? { ...item, isOpen: !item.isOpen } : item
    );

    setSteps(newSteps);
  };

  const renderDetails = (step) => {
    const redirectPage = ProgressLevels.find(
      (item) => item.label === step.label
    );
    const items = formData[step.value] || {};
    return Object.keys(items).map((key) => (
      <div>
        {items[key]?.option && (
          <div styleName="detail">
            <div styleName="itemWrapper">
              <p styleName="item">{items[key]?.title}</p>
              {enableEdit && (
                <Link styleName="link" to={redirectPage?.url}>
                  edit
                </Link>
              )}
            </div>
            <p styleName="key">{items[key]?.option}</p>
          </div>
        )}
      </div>
    ));
  };

  const renderPageDetails = (step) => {
    const items = formData[step.value] || {};
    const pages = items?.pages || [];
    const redirectPage = ProgressLevels.find(
      (item) => item.label === step.label
    );

    return pages.map((page, index) => {
      return (
        <div>
          {page?.pageName && (
            <div styleName="detail">
              <div styleName="itemWrapper">
                <p styleName="item">Page {index + 1} Name</p>
                {enableEdit && (
                  <Link styleName="link" to={redirectPage?.url}>
                    edit
                  </Link>
                )}
              </div>
              <p styleName="key">{page?.pageName}</p>
            </div>
          )}
          {page?.pageDetails && (
            <div styleName="detail">
              <div styleName="itemWrapper">
                <p styleName="item">Page {index + 1} Requirements</p>
                {enableEdit && (
                  <Link styleName="link" to={redirectPage?.url}>
                    edit
                  </Link>
                )}
              </div>
              <p styleName="key">{page?.pageDetails}</p>
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <>
      {steps.map((step, index) => {
        return (
          <>
            <div
              styleName="header"
              role="button"
              tabIndex={0}
              onClick={() => setStepToggler(index)}
            >
              <p styleName="stepLabel">{step.label}</p>
              <div styleName={classNames("icon", step.isOpen ? "open" : null)}>
                <ArrowIcon />
              </div>
            </div>

            {step.isOpen
              ? step.value === "pageDetails"
                ? renderPageDetails(step)
                : renderDetails(step)
              : null}

            <PageDivider />
          </>
        );
      })}
    </>
  );
};

export default ReviewTable;