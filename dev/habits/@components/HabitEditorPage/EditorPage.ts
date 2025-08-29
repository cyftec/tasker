import { compute, derive, op, signal, trap } from "@cyftech/signal";
import { component, m } from "@mufw/maya";
import { INITIAL_SETTINGS } from "../../../@common/constants";
import {
  getEditPageSettings,
  saveHabit,
  stopHabit,
} from "../../../@common/localstorage";
import {
  getHabitValidationError,
  getNewHabit,
  getUpdatedTrackerDataForModifiedLevels,
} from "../../../@common/transforms";
import { HabitUI } from "../../../@common/types";
import {
  GoBackButton,
  HabitDeleteModal,
  HabitStopModal,
  HTMLPage,
  Section,
} from "../../../@components";
import { Button, Link, Scaffold } from "../../../@elements";
import { HabitEditor } from "./HabitEditor";

type HabitEditorPageProps = {
  editableHabit?: HabitUI;
  onMount?: () => void;
};

export const HabitEditorPage = component<HabitEditorPageProps>(
  ({ editableHabit, onMount }) => {
    const editPageSettings = signal(INITIAL_SETTINGS.editPage);
    const deleteActionModalOpen = signal(false);
    const stopActionModalOpen = signal(false);
    const error = signal("");
    const editedHabit = signal<HabitUI>(getNewHabit());
    const pageTitle = compute(
      (edHab) => (edHab ? `Edit '${edHab.title}'` : "Add new habit"),
      editableHabit
    );
    const pageTitleCss = op(pageTitle).lengthGT(22).ternary("f2dot66", "");
    const actionButtonLabel = op(editableHabit).ternary("Update", "Add");

    const openDeleteModal = () => (deleteActionModalOpen.value = true);
    const closeDeleteModal = () => (deleteActionModalOpen.value = false);

    const onHabitDelete = () => {
      closeDeleteModal();
      history.go(-2);
    };

    const openHabitStopModal = () => (stopActionModalOpen.value = true);
    const closeHabitStopModal = () => (stopActionModalOpen.value = false);

    const onStopHabitUpdate = () => {
      stopHabit(editedHabit.value);
      closeHabitStopModal();
      history.back();
    };

    const onHabitChange = (updatedHabit: HabitUI) =>
      (editedHabit.value = updatedHabit);

    const save = () => {
      error.value = getHabitValidationError(
        editedHabit.value,
        !editableHabit?.value
      );
      if (error.value) return;

      const newHabit = editedHabit.value;
      const oldLevels = [...(editableHabit?.value?.levels || [])];
      const updatedTracker = getUpdatedTrackerDataForModifiedLevels(
        oldLevels,
        newHabit.levels,
        newHabit.tracker
      );
      saveHabit({ ...editedHabit.value, tracker: updatedTracker });
      history.back();
    };

    const onPageMount = () => {
      if (onMount) {
        onMount();
        // After onMount in parent, 'editableHabit' gets loaded
        editedHabit.value = editableHabit?.value as HabitUI;
      }
      editPageSettings.value = getEditPageSettings();
    };

    return HTMLPage({
      onMount: onPageMount,
      body: Scaffold({
        cssClasses: "bg-white ph3",
        header: m.Div({
          class: pageTitleCss,
          children: pageTitle,
        }),
        content: m.Div([
          m.If({
            subject: editableHabit,
            isTruthy: () =>
              m.Div([
                Section({
                  cssClasses: "pb2",
                  title: "Actions",
                  children: [
                    HabitDeleteModal({
                      isOpen: deleteActionModalOpen,
                      habit: editedHabit,
                      onClose: closeDeleteModal,
                      onDone: onHabitDelete,
                    }),
                    Link({
                      cssClasses: "db mb3 f6 red",
                      children: `Delete this habit permanently along with its data`,
                      onClick: openDeleteModal,
                    }),
                    HabitStopModal({
                      isOpen: stopActionModalOpen,
                      habit: editedHabit,
                      onClose: closeHabitStopModal,
                      onDone: onStopHabitUpdate,
                    }),
                    Link({
                      cssClasses: "db mb3 f6 gray",
                      children: `Stop this habit permanently and keep it for future`,
                      onClick: openHabitStopModal,
                    }),
                  ],
                }),
              ]),
          }),
          HabitEditor({
            editableHabit: editableHabit,
            editedHabit: editedHabit,
            hideDescriptions: derive(() => !editPageSettings.value.showHints),
            showFullCustomisations: trap(editPageSettings).prop(
              "showFullCustomisation"
            ),
            onChange: onHabitChange,
          }),
        ]),
        bottombar: m.Div({
          class: "bg-white w-100 pv3",
          children: [
            m.If({
              subject: error,
              isTruthy: () =>
                m.Div({
                  class: "red mb3",
                  children: error,
                }),
            }),
            m.Div({
              class: "flex items-center justify-stretch",
              children: [
                GoBackButton({
                  cssClasses: "w4dot50 w4dot25-ns",
                }),
                Button({
                  cssClasses: "w-100 pa3 ml3 b",
                  children: actionButtonLabel,
                  onTap: save,
                }),
              ],
            }),
          ],
        }),
      }),
    });
  }
);
