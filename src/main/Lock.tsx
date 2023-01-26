import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { settings } from "../config";
import { setLock, video } from "../redux/videoSlice";
import { client } from "../util/client";
import { useInterval } from "../util/utilityFunctions";


const Lock: React.FC<{}> = () => {

  const dispatch = useDispatch();
  const lockingActive = useSelector((state: { videoState: { lockingActive: video["lockingActive"] } }) => state.videoState.lockingActive);
  const lockRefresh = useSelector((state: { videoState: { lockRefresh: video["lockRefresh"] } }) => state.videoState.lockRefresh);
  const lock = useSelector((state: { videoState: { lock: video["lock"] } }) => state.videoState.lock);

  let endpoint = `${settings.opencast.url}/editor/${settings.id}/lock`
  let body = lock

  // Request lock
  useEffect(() => {
    if (lockingActive) {
      client.post(endpoint, body);
      dispatch(setLock(body))
    }

  // Only run when the locking enabled/disabled
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lockingActive])

  // Refresh lock
  useInterval( async () => {
    await client.post(endpoint, body);
  }, lockRefresh);

  return (<></>);
}

export default Lock;
