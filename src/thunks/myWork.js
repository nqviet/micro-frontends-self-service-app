import axios from "axios";
import moment from "moment";
import { getUserHandle } from "hoc/withAuthentication/selectors";
import * as services from "services/myWork";
import * as selectors from "selectors/myWork";
import * as actions from "actions/myWork";
import {
  CHALLENGE_STATUS,
  WORK_STATUS_MAP,
  WORK_STATUS_ORDER,
} from "constants/index.js";
import { sortBySortOrder } from "utils";

/**
 * Loads work items as pages, concatenates these pages and adds proper work
 * statuses and sorting orders to work items.
 *
 * @returns {() => Promise}
 */
export const loadWorks = () => async (dispatch, getState) => {
  const state = getState();
  selectors.getWorksCancelSource(state)?.cancel();
  const handle = getUserHandle(state);
  const works = [];
  let page = 1;
  const perPage = 100;
  const now = moment();
  let [promise, cancelSource] = services.getWorks(handle, { page, perPage });
  dispatch(actions.loadWorksPending(cancelSource));
  try {
    const promises = [promise];
    const { pagination } = await promise;
    const { totalPages } = pagination;
    for (page = 2; page <= totalPages; page++) {
      [promise] = services.getWorks(handle, { page, perPage }, cancelSource);
      promises.push(promise);
    }
    const results = await Promise.all(promises);
    for (let result of results) {
      for (let item of result.data) {
        let sortOrder = WORK_STATUS_ORDER.Unknown;
        let status = item.status;
        let challengeStatus = status;
        let workStatus = WORK_STATUS_MAP[status];
        if (workStatus) {
          sortOrder = WORK_STATUS_ORDER[status];
        } else {
          for (let key in WORK_STATUS_MAP) {
            if (status.toLowerCase().includes(key.toLowerCase())) {
              challengeStatus = key;
              workStatus = WORK_STATUS_MAP[key];
              sortOrder = WORK_STATUS_ORDER[key];
              break;
            }
          }
          if (!workStatus) {
            workStatus = status;
          }
        }
        let nextActionName = null;
        if (challengeStatus === CHALLENGE_STATUS.NEW) {
          nextActionName = "Submit work";
        } else if (
          challengeStatus === CHALLENGE_STATUS.DRAFT ||
          challengeStatus === CHALLENGE_STATUS.ACTIVE
        ) {
          nextActionName = "Accept";
        }
        let messagesCount = Math.floor(Math.random() * 100);
        item.nextActionName = nextActionName;
        item.challengeStatus = challengeStatus;
        item.workStatus = workStatus;
        item.sortOrder = sortOrder;
        item.messagesCount = messagesCount;
        item.messagesHasNew = !!messagesCount && !!Math.round(Math.random());
        item.rating = Math.round(Math.random() * 5);
        works.push(item);
      }
    }
  } catch (error) {
    if (!axios.isCancel(error)) {
      dispatch(actions.loadWorksError(error.toString()));
    }
    return;
  }
  works.sort(sortBySortOrder);
  dispatch(actions.loadWorksSuccess(works));
};
