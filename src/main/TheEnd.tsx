import React from "react";

import { css } from "@emotion/react";

import { LuCheckCircle, LuXCircle } from "react-icons/lu";

import { useAppSelector } from "../redux/store";
import { selectEndState } from "../redux/endSlice";
import { basicButtonStyle, flexGapReplacementStyle, navigationButtonStyle, titleStyleBold } from "../cssStyles";

import { useTranslation } from "react-i18next";
import { useTheme } from "../themes";
import { ThemedTooltip } from "./Tooltip";
import { CallbackButton } from "./Finish";

/**
 * This page is to be displayed when the user is "done" with the editor
 * and should not be able to perfom any actions anymore
 */
const TheEnd: React.FC = () => {

  const { t } = useTranslation();

  // Init redux variables
  const endState = useAppSelector(selectEndState);

  const text = () => {
    if (endState === "discarded") {
      return (<div>{t("theEnd.discarded-text")}</div>);
    } else if (endState === "success") {
      return (
        <div css={css({
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          ...(flexGapReplacementStyle(20, false)),
        })}>
          <div css={titleStyleBold(useTheme())}>{t("theEnd.info-title")}</div>
          <div css={css({ width: "50%" })}>{t("theEnd.info-text")}</div>
        </div>);
    }
  };

  const theEndStyle = css({
    width: "100%",
    height: "calc(100% - 64px)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    ...(flexGapReplacementStyle(20, false)),
  });

  const restartOrBackStyle = css({
    display: "flex",
    flexDirection: "row",
    ...(flexGapReplacementStyle(20, false)),
  });

  return (
    <div css={theEndStyle}>
      <div/>
      <div/>
      {endState === "discarded" ? <LuXCircle css={{ fontSize: 80 }} /> : <LuCheckCircle css={{ fontSize: 80 }} />}
      {text()}
      <div css={restartOrBackStyle}>
        <CallbackButton />
        {(endState === "discarded") && <StartOverButton />}
      </div>
    </div>
  );
};


const StartOverButton: React.FC = () => {

  const { t } = useTranslation();
  const theme = useTheme();

  const reloadPage = () => {
    window.location.reload();
  };

  return (
    <ThemedTooltip title={t("theEnd.startOver-tooltip")}>
      <div css={[basicButtonStyle(theme), navigationButtonStyle(theme)]}
        role="button" tabIndex={0}
        onClick={reloadPage}
        onKeyDown={(event: React.KeyboardEvent<HTMLDivElement>) => {
          if (event.key === " " || event.key === "Enter") {
            reloadPage();
          }
        }}>
        <span>{t("theEnd.startOver-button")}</span>
      </div>
    </ThemedTooltip>
  );
};

export default TheEnd;
