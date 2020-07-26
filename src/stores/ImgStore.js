import { observable, action } from 'mobx';

class ImgStore {
  @observable img = '';

  @action
  async getImg() {
    try {
      return this.img
    } catch (e) {
      throw e;
    }
  }

  @action
  async setImg(img) {
    try {
      this.img = img
    } catch (e) {
      throw e;
    }
  }
}

export default new ImgStore();

