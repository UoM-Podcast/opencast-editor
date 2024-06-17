
import React from "react";
import { useAppSelector } from "../redux/store";
import { useTheme } from "../themes";

import { css } from "@emotion/react";
import { useTranslation } from "react-i18next";
import { MainMenuButton } from "./MainMenu";
import { LuMoon, LuSun } from "react-icons/lu";
import { HiOutlineTranslate } from "react-icons/hi";
import { LuKeyboard, LuHelpCircle } from "react-icons/lu";
import { MainMenuStateNames } from "../types";
import { basicButtonStyle, BREAKPOINT_MEDIUM, BREAKPOINT_SMALL, flexGapReplacementStyle, titleStyleBold }
  from "../cssStyles";
import LogoSvg from "../img/podcast.svg?react";
import { selectIsEnd } from "../redux/endSlice";
import { checkboxMenuItem, HeaderMenuItemDef, ProtoButton, useColorScheme, WithHeaderMenu } from "@opencast/appkit";
import { IconType } from "react-icons";
import i18next from "i18next";
import { languages as lngs } from "../i18n/lngs-generated";
import { settings } from "../config";

function Header() {
  const theme = useTheme();
  const { scheme } = useColorScheme();
  const { t } = useTranslation();

  const isEnd = useAppSelector(selectIsEnd);

  const headerStyle = css({
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: `${theme.header_bg}`,
  });

  const headerStyleThemed = scheme.includes("high-contrast-")
    ? css({
      height: "62px",
      borderBottom: "2px solid white",
    })
    : css({
      height: "64px",
    });

  const rightSideButtonsStyle = css({
    display: "flex",
    flexDirection: "row",
    height: "100%",
    alignItems: "center",
    paddingRight: "24px",
    ...(flexGapReplacementStyle(16, false)),
  });


  const settingsButtonCSS = css({
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    ...(flexGapReplacementStyle(8, false)),

    fontSize: 16,
    fontFamily: "inherit",
    fontWeight: 500,
    color: `${theme.header_text}`,
    outline: `${theme.menuButton_outline}`,
    padding: "6px 8px",

    ":hover, :active": {
      outline: `2px solid ${theme.metadata_highlight}`,
      backgroundColor: theme.header_button_hover_bg,
      color: `${theme.header_text}`,
    },
  });

  const openInNewTab = (url: string): void => {
    const newWindow = window.open(url, "_blank", "noopener,noreferrer");
    if (newWindow) {
      newWindow.opener = null;
    }
  };

  const onClickUrl = (url: string): (() => void) => () => openInNewTab(url);

  return (
    <div css={[headerStyle, headerStyleThemed]}>
      <div css={rightSideButtonsStyle}>
        <Logo />
        <div css={[titleStyleBold(theme), css({ color: `${theme.header_text}` })]}>Podcast Editor</div>
      </div>
      <div css={rightSideButtonsStyle}>
        {lngs.size > 1 && <LanguageButton />}
        <ThemeButton />
        {!isEnd &&
          <MainMenuButton
            Icon={LuKeyboard}
            stateName={MainMenuStateNames.keyboardControls}
            bottomText={t("keyboardControls.header")}
            ariaLabelText={t("keyboardControls.header")}
            customCSS={settingsButtonCSS}
            iconCustomCSS={css({ fontSize: 22 })}
          />
        }
        {settings.help.url && <span onClick={onClickUrl(settings.help.url)}>
          <HeaderButton Icon={LuHelpCircle} label={t("mainMenu.help-button")}/>
        </span>}
      </div>
    </div>
  );
}

const Logo: React.FC = () => {

  const { t } = useTranslation();
  const { scheme } = useColorScheme();

  const logo = css({
    paddingLeft: "8px",
    opacity: scheme === "dark" ? "0.8" : "1",

    height: "100%",
    "> *": {
      height: "calc(100% - 12px)",
    },

    // Unset a bunch of CSS to keep the logo clean
    outline: "unset",
    "&:hover": {
      backgroundColor: "unset",
    },
    "&:focus": {
      backgroundColor: "unset",
    },
  });

  return (
    <MainMenuButton
      Icon={LogoSvg}
      stateName={MainMenuStateNames.cutting}
      bottomText={""}
      ariaLabelText={t("mainMenu.cutting-button")}
      customCSS={logo}
      iconCustomCSS={css({ width: "auto", height: "60px" })}
    />
  );
};

const LanguageButton: React.FC = () => {
  const { t } = useTranslation();

  const isCurrentLanguage = (language: string) => language === i18next.resolvedLanguage;

  const changeLanguage = (lng: string | undefined) => {
    i18next.changeLanguage(lng);
  };

  const languageNames = (language: string) => {
    return new Intl.DisplayNames([language], {
      type: "language",
    }).of(language);
  };

  const languages = Array.from(lngs, ([key, value]) => {
    return { value: value, label: languageNames(key) };
  });

  // menuItems can"t deal with languages being undefined, so we return early
  // until we reach a rerender with actual information
  if (languages === undefined) {
    return (<></>);
  }

  const menuItems = Object.values(languages).map(lng => checkboxMenuItem({
    checked: isCurrentLanguage(lng.value),
    children: <>{lng.label}</>,
    onClick: () => {
      changeLanguage(lng?.value);
    },
  }));

  const label = t("language.language");
  return (
    <WithHeaderMenu
      menu={{
        label,
        items: menuItems,
        breakpoint: BREAKPOINT_SMALL,
      }}
    >
      <HeaderButton Icon={HiOutlineTranslate} label={label} />
    </WithHeaderMenu>
  );
};

const ThemeButton: React.FC = () => {

  const { t } = useTranslation();

  const { scheme, isAuto, update } = useColorScheme();
  const currentPref = isAuto ? "auto" : scheme;
  const choices = ["auto", "light", "dark", "light-high-contrast", "dark-high-contrast"] as const;
  const menuItems: HeaderMenuItemDef[] = choices.map(choice => checkboxMenuItem({
    checked: currentPref === choice,
    children: <>{t(`theme.${choice}`)}</>,
    onClick: () => update(choice),
  }));

  return (
    <WithHeaderMenu
      menu={{
        label: t("theme.appearance"),
        items: menuItems,
        breakpoint: BREAKPOINT_MEDIUM,
      }}>
      <HeaderButton
        Icon={scheme === "light" || scheme === "light-high-contrast" ? LuMoon : LuSun}
        label={t("theme.appearance")}
      />
    </WithHeaderMenu>
  );
};

type HeaderButtonProps = JSX.IntrinsicElements["button"] & {
  Icon: IconType;
  label: string;
};

const HeaderButton = React.forwardRef<HTMLButtonElement, HeaderButtonProps>(
  ({ Icon, label, ...rest }, ref) => {
    const theme = useTheme();

    const themeSelectorButtonStyle = css({
      display: "flex",
      alignItems: "center",
      ...(flexGapReplacementStyle(8, false)),

      fontSize: 16,
      fontFamily: "inherit",
      fontWeight: 500,
      color: `${theme.header_text}`,
      outline: `${theme.menuButton_outline}`,
      padding: "6px 8px",

      ":hover, :active": {
        outline: `2px solid ${theme.metadata_highlight}`,
        backgroundColor: theme.header_button_hover_bg,
        color: `${theme.header_text}`,
      },
      ":focus": {
        backgroundColor: "inherit",
        color: `${theme.header_text}`,
      },
      ":focus:hover": {
        backgroundColor: theme.header_button_hover_bg,
        color: `${theme.header_text}`,
      },
    });

    const iconStyle = css({
      display: "flex",
      alignItems: "center",

      fontSize: 22,
    });

    return (
      <ProtoButton {...rest} ref={ref}
        css={[basicButtonStyle(theme), themeSelectorButtonStyle]}
      >
        <Icon css={iconStyle} />
        <span css={{
          [`@media (max-width: ${BREAKPOINT_MEDIUM}px)`]: {
            display: "none",
          },
        }}>{label}</span>
      </ProtoButton>
    );
  });

export default Header;
