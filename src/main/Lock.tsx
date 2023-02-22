import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { settings } from "../config";
import { setLock, video } from "../redux/videoSlice";
import { client } from "../util/client";
import { useInterval } from "../util/utilityFunctions";
import { useBeforeunload } from 'react-beforeunload';

const Lock: React.FC<{}> = () => {

  const dispatch = useDispatch();
  const lockingActive = useSelector((state: { videoState: { lockingActive: video["lockingActive"] } }) => state.videoState.lockingActive);
  const lockRefresh = useSelector((state: { videoState: { lockRefresh: video["lockRefresh"] } }) => state.videoState.lockRefresh);
  const lockState = useSelector((state: { videoState: { lockState: video["lockState"] } }) => state.videoState.lockState);
  const lock = useSelector((state: { videoState: { lock: video["lock"] } }) => state.videoState.lock);

  let endpoint = `${settings.opencast.url}/editor/${settings.id}/lock`

  function requestLock() {
    client.post(endpoint, lock)
    .then( () => dispatch(setLock(true)))
    .catch( () => dispatch(setLock(false)));
  };

  function releaseLock()  {
    if (lockingActive && lockState) {
      client.delete(endpoint + '/' + lock.uuid)
      .then( () => {
        dispatch(setLock(false));
        console.info("Lock released");
      });
    }
  };

  // Request lock
  useEffect(() => {
    if (lockingActive) {
      requestLock();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lockingActive])

  // Refresh lock
  useInterval( async () => {
    requestLock();
  }, lockingActive ? lockRefresh : null);

  // Release lock on leaving page
  // FIXME: callback not called
  useBeforeunload((event: { preventDefault: () => void; }) =>  {
      releaseLock();
  });

  return (<></>);
}

export default Lock;
