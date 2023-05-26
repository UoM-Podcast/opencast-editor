import React, { useEffect, useState } from "react";

import { css } from '@emotion/react'
import { backOrContinueStyle, errorBoxStyle, flexGapReplacementStyle } from '../cssStyles'

import { useDispatch, useSelector } from 'react-redux';
import { selectWorkflows, setSelectedWorkflowIndex } from '../redux/videoSlice'
import { selectFinishState, selectPageNumber } from '../redux/finishSlice'

import { PageButton } from './Finish'
import { faChevronLeft } from "@fortawesome/free-solid-svg-icons";
import { SaveAndProcessButton } from "./WorkflowConfiguration";
import { selectStatus, selectError } from "../redux/workflowPostAndProcessSlice";
import { selectStatus as saveSelectStatus, selectError as saveSelectError } from "../redux/workflowPostSlice";
import { httpRequestState, Workflow } from "../types";
import { SaveButton } from "./Save";
import { EmotionJSX } from "@emotion/react/types/jsx-namespace";

import './../i18n/config';
import { useTranslation } from 'react-i18next';
import { Trans } from "react-i18next";
import { selectTheme } from "../redux/themeSlice";
import { settings } from "../config";
import { FormControl, InputLabel, MenuItem, Select, SelectChangeEvent, useTheme } from "@mui/material";

/**
 * Allows the user to select a workflow
 */
const WorkflowSelection : React.FC<{}> = () => {

  const { t } = useTranslation();

  const dispatch = useDispatch();

  // Initialite redux states
  let workflows = useSelector(selectWorkflows)
  let [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null)
  const finishState = useSelector(selectFinishState)
  const pageNumber = useSelector(selectPageNumber)
  const theme = useSelector(selectTheme)
  const themePalette = useTheme().palette

  const postAndProcessWorkflowStatus = useSelector(selectStatus);
  const postAndProcessError = useSelector(selectError)
  const saveStatus = useSelector(saveSelectStatus);
  const saveError = useSelector(saveSelectError)

  const workflowSelectionStyle = css({
    padding: '20px',
    display: (finishState === "Start processing" && pageNumber === 1) ? 'flex' : 'none',
    flexDirection: 'column' as const,
    justifyContent: 'center',
    alignItems: 'center',
    ...(flexGapReplacementStyle(30, false)),
  })

  const workflowSelectionSelectionStyle = css({
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'left',
    ...(flexGapReplacementStyle(20, false)),
    flexWrap: 'wrap',
    maxHeight: '50vh',
  })

  const workflowFilter = settings.workflow;
  workflows = workflows.filter((workflow: Workflow) => {
    if (workflow.displayOrder >= workflowFilter.minimum && workflow.displayOrder <= workflowFilter.maximum) {
      const range: string = workflowFilter.range;
      if (range.indexOf(':') < 0) {
        throw new Error('Invalid configuration');
      }
  
      const start: number = parseInt(range.split(':')[0]);
      const end: number = parseInt(range.split(':')[1]);
  
      if (workflow.displayOrder >= start && workflow.displayOrder <= end) {
        return true;
      }
  
      selectedWorkflow = null;
      return false;
    }

    selectedWorkflow = null;
    return false;
  });

  useEffect(() => {
    if (workflows.length >= 1) {
      dispatch(setSelectedWorkflowIndex(workflows[0].id))
    }
  }, [dispatch, workflows])

  const handleWorkflowSelectChange = (event: SelectChangeEvent) => {
    const selected: Workflow | undefined = workflows.find((w) => w.id === event.target.value);
    if (selected) {
      setSelectedWorkflow(selected);
      dispatch(setSelectedWorkflowIndex(event.target.value));
    }
  };

  // Layout template
  const render = (topTitle: string, topText: {} | null | undefined, hasWorkflowButtons: boolean,
    nextButton: EmotionJSX.Element, errorStatus: httpRequestState["status"],
    errorMessage: httpRequestState["error"]) => {
    return (
      <div css={workflowSelectionStyle}>
        <h2>{topTitle}</h2>
        {topText}
        { hasWorkflowButtons &&
              <FormControl style={{minWidth: 250}}>
                <InputLabel css={workflowSelectionSelectionStyle}
                            style={{color: themePalette.text.primary}}
                            htmlFor='selected-workflow'>Select workflow</InputLabel>
                <Select
                  labelId="workflow"
                  id="workflow"
                  value={selectedWorkflow ? selectedWorkflow?.id : ''}
                  label="Workflow Selection Area"
                  onChange={handleWorkflowSelectChange}
                  css={workflowSelectionSelectionStyle}
                  >
                  {workflows.map( (workflow: Workflow) => (
                    <MenuItem key={workflow.id} value={workflow.id}>{workflow.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
        }
        <div css={backOrContinueStyle}>
          <PageButton pageNumber={0} label={t("workflowSelection.back-button")} iconName={faChevronLeft}/>
          {/* <PageButton pageNumber={2} label="Continue" iconName={faChevronRight}/> */}
          {selectedWorkflow ? nextButton : <></>}
        </div>
        <div css={errorBoxStyle(errorStatus === "failed", theme)} role="alert">
          <span>{t("various.error-text")}</span><br />
          {errorMessage ? t("various.error-details-text", {errorMessage: postAndProcessError}) : t("various.error-text")}<br/>
        </div>
      </div>
    );
  }

  // Fills the layout template with values based on how many workflows are available
  const renderSelection = () => {
    if (workflows.length <= 0) {
      return(
        render(
          t("workflowSelection.saveAndProcess-text"),
          <Trans i18nKey="workflowSelection.noWorkflows-text">
            There are no workflows to process your changes with.<br />
            Please save your changes and contact an administrator.
          </Trans>,
          false,
          <SaveButton />,
          saveStatus,
          saveError
        )
      );
    } else if (workflows.length === 1) {
      return (
        render(
          t("workflowSelection.saveAndProcess-text"),
          <Trans i18nKey="workflowSelection.oneWorkflow-text">
            The video will be cut and processed with the workflow "{{workflow: workflows[0].name}}".<br/>
            This will take some time.
          </Trans>,
          false,
          <SaveAndProcessButton text={t("workflowSelection.startProcessing-button")}/>,
          postAndProcessWorkflowStatus,
          postAndProcessError
        )
      );
    } else {
      return (
        render(
          t("workflowSelection.selectWF-text"),
          <div>
            {t("workflowSelection.manyWorkflows-text")}
          </div>,
          true,
          <SaveAndProcessButton text= {t("workflowSelection.startProcessing-button")}/>,
          postAndProcessWorkflowStatus,
          postAndProcessError
        )
      )
    }
  }

  return (
    renderSelection()
  );
}

export default WorkflowSelection;
