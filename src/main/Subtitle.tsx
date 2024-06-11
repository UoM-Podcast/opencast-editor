import React from "react";
import SubtitleEditor from "./SubtitleEditor";
import SubtitleSelect from "./SubtitleSelect";
import { useAppSelector } from "../redux/store";
import { selectIsDisplayEditView } from "../redux/subtitleSlice";

/**
 * A container for the various subtitle views
 */
const Subtitle: React.FC = () => {

  const displayEditView = useAppSelector(selectIsDisplayEditView);

  const render = () => {
    return displayEditView ? <SubtitleEditor /> : <SubtitleSelect />;
  };

  return (
    <>
      {render()}
    </>
  );
};

export default Subtitle;
