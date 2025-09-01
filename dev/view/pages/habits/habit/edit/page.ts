import { signal } from "@cyftech/signal";
import { HabitUI } from "../../../../../models/types";
import { getHabitFromUrl } from "../../../../../controllers/transforms";
import { HabitEditorPage } from "../../@components";

const editableHabit = signal<HabitUI | undefined>(undefined);

const onPageMount = () => {
  const fetchedHabit = getHabitFromUrl();
  if (!fetchedHabit) {
    throw "Invalid habit ID in query params. No habit fetched.";
  }

  editableHabit.value = fetchedHabit;
};

export default HabitEditorPage({
  editableHabit: editableHabit,
  onMount: onPageMount,
});
