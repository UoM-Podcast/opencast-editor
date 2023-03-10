import React, { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { settings } from "../config";
import { lockData, setLock, video } from "../redux/videoSlice";
import { setError } from "../redux/errorSlice";
import { client } from "../util/client";
import { useInterval } from "../util/utilityFunctions";
import { faLock } from "@fortawesome/free-solid-svg-icons";

export type ILock = {
  lockingActive: boolean;
  lockRefresh: number;
  lockState: boolean;
  lock: lockData;
  lockError: string;
};

const Lock: React.FC<{}> = () => {
  const [state, setState] = useState({
    lockingActive: false,
    lockRefresh: 6000,
    lockState: false,
    lock: {uuid: '', user: ''},
    lockError: ''
  });
  const dispatch = useDispatch();
  const lockDispatch = useCallback(() => dispatch({
    type: 'SET_LOCK',
    lockingActive: true,
    lockRefresh: 6000,
    lockState: false,
    lock: {uuid: '', user: ''},
    lockError: ''
  }), [dispatch]);
  const errorDispatch = useDispatch();
  const lockingActive = useSelector((state: { videoState: { lockingActive: video["lockingActive"] } }) => state.videoState.lockingActive);
  const lockRefresh = useSelector((state: { videoState: { lockRefresh: video["lockRefresh"] } }) => state.videoState.lockRefresh);
  const lockState = useSelector((state: { videoState: { lockState: video["lockState"] } }) => state.videoState.lockState);
  const lock = useSelector((state: { videoState: { lock: video["lock"] } }) => state.videoState.lock);

  let endpoint = `${settings.opencast.url}/editor/${settings.id}/lock`

  function requestLock() {
    client.post(endpoint, lock)
    .then(() => {
      lockDispatch();
    })
    .catch((error: string) => {
      setState({
        lockingActive: lockingActive,
        lockState: lockState,
        lockError: error,
        lock: lock,
        lockRefresh: lockRefresh
      });
      errorDispatch(setError({
        error: true,
        errorDetails: error,
        errorIcon: faLock,
        errorTitle: 'Editor locked',
        errorMessage: 'This video is currently being edited by another user'
      }));
    });
  };

  function releaseLock()  {
    client.delete(`${endpoint}/${lock.uuid}`)
    .then(() => {
      dispatch(setLock(false));
    });
  };

  // Request lock
  useEffect(() => {
    const cleanup = () => {
      if (lock.user && lock.uuid) {
        releaseLock();
        setState({
          lockingActive: false,
          lockRefresh: lockRefresh,
          lockState: false,
          lock: {user: '', uuid: ''},
          lockError: ''
        });
      }
    };

    if (lock.user && lock.uuid && !lockingActive) {
      requestLock();
    }

    window.addEventListener('beforeunload', cleanup);
    return () => {
      cleanup();
      window.removeEventListener('beforeunload', cleanup);
    }
  }, [lock, lockingActive, lockRefresh]);


  // Refresh lock
  useInterval( async () => {
    requestLock();
  }, lockingActive ? lockRefresh : null);

  return (<></>);
}

export default Lock;
