import { observable, action } from 'mobx';

class ReportStore {
  @observable report = [];

  @action
  async getReport() {
    try {
      return this.report
    } catch (e) {
      throw e;
    }
  }

  @action
  async setReport(report) {
    try {
      this.report = report
    } catch (e) {
      throw e;
    }
  }
}

export default new ReportStore();
