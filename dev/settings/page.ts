import { tmpl, signal, trap } from "@cyftech/signal";
import { m } from "@mufw/maya";
import {
  APP_VERSION,
  INITIAL_SETTINGS,
  INITIAL_STORAGE_DATA,
} from "../@common/constants";
import {
  getEditPageSettings,
  getStorageData,
  updateEditPageSettings,
} from "../@common/localstorage";
import { StorageDetails } from "../@common/types";
import { goToPrivacyPolicyPage } from "../@common/utils";
import { HTMLPage, NavScaffold, Section } from "../@components";
import { Divider, Icon, Link } from "../@elements";
import { ToggleSetting } from "./@components/ToggleSetting";

const editPageSettings = signal(INITIAL_SETTINGS.editPage);
const { showHints, showFullCustomisation } = trap(editPageSettings).props;
const storageSpace = signal<StorageDetails>(INITIAL_STORAGE_DATA);
const storageSpaceLabel = tmpl`${() =>
  storageSpace.value.total?.toFixed(2)} KB used (${() =>
  storageSpace.value.spaceLeft?.toFixed(2)}% left)`;

const onEditPageHintsSettingToggle = () => {
  updateEditPageSettings({
    ...editPageSettings.value,
    showHints: !showHints.value,
  });
  editPageSettings.value = getEditPageSettings();
};

const onEditPageCustomisationsSettingToggle = () => {
  updateEditPageSettings({
    ...editPageSettings.value,
    showFullCustomisation: !showFullCustomisation.value,
  });
  editPageSettings.value = getEditPageSettings();
};

const onPageMount = () => {
  storageSpace.value = getStorageData();
  editPageSettings.value = getEditPageSettings();
};

export default HTMLPage({
  cssClasses: "bg-white",
  onMount: onPageMount,
  body: NavScaffold({
    cssClasses: "ph3 bg-white",
    route: "/settings/",
    header: "Settings",
    content: m.Div({
      children: [
        Section({
          cssClasses: "pb3",
          title: "Storage space",
          children: storageSpaceLabel,
        }),
        Section({
          cssClasses: "pb3",
          title: "Preferences",
          children: [
            Divider({ cssClasses: "mv2" }),
            ToggleSetting({
              label: "Show hints on Edit page",
              isToggleOn: showHints,
              onToggle: onEditPageHintsSettingToggle,
            }),
            Divider({ cssClasses: "mv2" }),
            ToggleSetting({
              label: "Always show more customisations on Edit page",
              isToggleOn: showFullCustomisation,
              onToggle: onEditPageCustomisationsSettingToggle,
            }),
            Divider({ cssClasses: "mv2" }),
          ],
        }),
        Section({
          cssClasses: "pb3",
          title: "Privacy Policy",
          description: `
            This app does not collect any data, nor does it store
            them remotely or send elsewhere for data persistence.
            It uses local storage of the browser for saving data. And it is safe
            for use by any age group person.`,
          children: Link({
            cssClasses: "flex items-center",
            onClick: goToPrivacyPolicyPage,
            children: [
              "Read complete policy here",
              Icon({
                cssClasses: "ml1",
                size: 12,
                iconName: "call_made",
              }),
            ],
          }),
        }),
        Section({
          contentCssClasses: "flex justify-between",
          title: "About",
          children: [
            m.Div([
              m.Div({
                class: "",
                children: "Habits (by Cyfer)",
              }),
              m.Div({
                class: "silver mt1",
                children: `version ${APP_VERSION}`,
              }),
              m.Div({
                class: "silver mt1 flex items-center",
                children: [
                  "Made with",
                  Icon({
                    cssClasses: "mh1 gray",
                    size: 21,
                    iconName: "volunteer_activism",
                  }),
                  "from Bharat",
                ],
              }),
            ]),
            m.Div({
              class: "pa05 h3 bg-green ba b--blue relative",
              children: [
                m.Div({
                  class: "absolute top-0 left-0 right-0 bg-white",
                  style: "height: 66.6%;",
                }),
                m.Div({
                  class: "absolute top-0 left-0 right-0 bg-orange",
                  style: "height: 33.3%;",
                }),
              ],
            }),
          ],
        }),
      ],
    }),
  }),
});
