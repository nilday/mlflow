import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import qs from 'qs';
import { getExperimentApi, getMetricHistoryApi, getUUID } from '../Actions';
import RequestStateWrapper from './RequestStateWrapper';
import NotFoundPage from './NotFoundPage';
import MetricView from './MetricView';

class MetricPage extends Component {
  static propTypes = {
    runUuids: PropTypes.arrayOf(String).isRequired,
    metricKey: PropTypes.string.isRequired,
    experimentId: PropTypes.number,
    dispatch: PropTypes.func.isRequired,
  };

  componentWillMount() {
    this.requestIds = [];
    if (this.props.experimentId !== null) {
      const experimentRequestId = getUUID();
      this.props.dispatch(getExperimentApi(this.props.experimentId, experimentRequestId));
      this.requestIds.push(experimentRequestId);
    }
    this.props.runUuids.forEach((runUuid) => {
      const requestId = getUUID();
      this.requestIds.push(requestId);
      this.props.dispatch(getMetricHistoryApi(runUuid, this.props.metricKey, requestId));
    });
  }

  render() {
    let view;
    if (this.props.runUuids.length >= 1) {
      view = <MetricView runUuids={this.props.runUuids}
                         metricKey={this.props.metricKey}
                         experimentId={this.props.experimentId}/>;
    } else {
      view = <NotFoundPage/>;
    }
    return (
      <RequestStateWrapper requestIds={this.requestIds}>
        {view}
      </RequestStateWrapper>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  const { match, location } = ownProps;
  const searchValues = qs.parse(location.search);
  const runUuids = JSON.parse(searchValues["?runs"]);
  let experimentId = null;
  if (searchValues.hasOwnProperty("experiment")) {
    experimentId = parseInt(searchValues["experiment"], 10);
  }
  const { metricKey } = match.params;
  return {
    runUuids,
    metricKey,
    experimentId,
  };
};

export default connect(mapStateToProps)(MetricPage);
