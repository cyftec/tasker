import { component, m } from "@mufw/maya";
import {
  HABITS_DATA_FILENAME,
  loadNewAppDataFromFile,
} from "../../../../controllers/utils";
import { Button, Link, Modal } from "../../../elements";
import { op, signal, trap } from "@cyftech/signal";

type AppDataLoaderLinkProps = {
  cssClasses?: string;
};

export const AppDataLoaderLink = component<AppDataLoaderLinkProps>(
  ({ cssClasses }) => {
    const fileInputElemId = "appDataFileInput";
    const isModalOpen = signal(false);
    const initialState = {
      success: false,
      message: "",
    };
    const selectionState = signal(initialState);
    const { success, message } = trap(selectionState).props;
    let selectedFile: File | undefined = undefined;

    const openModal = () => (isModalOpen.value = true);
    const closeModal = () => (isModalOpen.value = false);

    const readAndLoadNewData = (readerEvent: ProgressEvent<FileReader>) => {
      const fileContent = readerEvent.target?.result as string;
      try {
        loadNewAppDataFromFile(fileContent);
        selectionState.value = {
          success: true,
          message: `Successfully loaded '${selectedFile?.name}'`,
        };
      } catch (error) {
        selectionState.value = {
          success: false,
          message: `${error}`,
        };
      }
      setTimeout(() => {
        selectionState.value = initialState;
      }, 10000);
    };

    const onFileSelectionChange = (fileSelectionEvent: any) => {
      closeModal();
      selectedFile = fileSelectionEvent.target?.files[0];
      if (fileSelectionEvent.target) fileSelectionEvent.target.value = "";
      if (!selectedFile) return;

      if (selectedFile.type !== "application/json") {
        selectionState.value = {
          success: false,
          message: `Invalid file selected '${selectedFile.name}'. It should be a JSON file titled - '${HABITS_DATA_FILENAME}'.`,
        };
        setTimeout(() => {
          selectionState.value = initialState;
        }, 10000);
        return;
      }

      const reader = new FileReader();
      reader.onload = readAndLoadNewData;
      reader.readAsText(selectedFile);
    };

    return m.Div({
      class: cssClasses,
      children: [
        Modal({
          cssClasses: "pa3",
          isOpen: isModalOpen,
          onTapOutside: closeModal,
          content: [
            m.Div({
              class: "b f4",
              children: "Warning!!!",
            }),
            m.Div({
              class: "mv3",
              children: [
                `Loading new data from file will wipe out all existing app data. 
                Only do this if you're sure you have some app data or backup available to load.
                `,
                m.Br(),
                m.Br(),
                `Are you sure, you want to delete existing data?`,
              ],
            }),
            m.Div({
              children: [
                Button({
                  cssClasses: "w-25 pv2 ph3 mr1 b",
                  onTap: closeModal,
                  children: "No",
                }),
                m.Label({
                  for: fileInputElemId,
                  children: m.Span({
                    class: "ml2 pv2 ph3 b red ba bw1 br-pill b--light-silver",
                    children: "Yes, delete and load new",
                  }),
                }),
              ],
            }),
          ],
        }),
        m.Input({
          id: fileInputElemId,
          type: "file",
          class: "dn",
          onchange: onFileSelectionChange,
        }),
        Link({
          cssClasses: "db mt3 f6 underline",
          children: "Load new app data from file",
          onClick: openModal,
        }),
        m.If({
          subject: message,
          isTruthy: (subject) =>
            m.Div({
              class: op(success).ternary("mt3 green", "mt3 red"),
              children: subject,
            }),
        }),
      ],
    });
  }
);
