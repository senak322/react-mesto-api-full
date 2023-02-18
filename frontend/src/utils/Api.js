class Api {
  constructor(url, token) {
    this._url = url;
    // this._token = token;
    // this._headers = {
    //   // Authorization: `Bearer ${this._token}`,
    //   "Content-Type": "application/json",
    // };
  }

  _getResponseData(res) {
    if (!res.ok) {
      return Promise.reject(`Ошибка: ${res.status}`);
    }
    return res.json();
  }

  getImages() {
    this._token = localStorage.getItem("token");
    return fetch(`${this._url}/cards`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this._token}`,
      },
    }).then(this._getResponseData);
  }

  getProfileInfo() {
    this._token = localStorage.getItem("token");
    return fetch(`${this._url}/users/me`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this._token}`,
      },
    }).then(this._getResponseData);
  }

  editInfo(values) {
    this._token = localStorage.getItem("token");
    return fetch(`${this._url}/users/me`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this._token}`,
      },
      body: JSON.stringify({
        name: values.name,
        about: values.about,
      }),
    }).then(this._getResponseData);
  }

  addCard(values) {
    this._token = localStorage.getItem("token");
    return fetch(`${this._url}/cards`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this._token}`,
      },
      body: JSON.stringify({
        name: values.place,
        link: values.link,
      }),
    }).then(this._getResponseData);
  }

  deleteCard(cardId) {
    this._token = localStorage.getItem("token");
    return fetch(`${this._url}/cards/${cardId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this._token}`,
      },
    }).then(this._getResponseData);
  }

  likeCard(cardId) {
    this._token = localStorage.getItem("token");
    return fetch(`${this._url}/cards/${cardId}/likes`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this._token}`,
      },
    }).then(this._getResponseData);
  }

  unLikeCard(cardId) {
    this._token = localStorage.getItem("token");
    return fetch(`${this._url}/cards/${cardId}/likes`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this._token}`,
      },
    }).then(this._getResponseData);
  }

  changeLikeCardStatus(cardId, isLiked) {
    if (isLiked) {
      this.status = this.unLikeCard(cardId);
      return this.status;
    } else {
      this.status = this.likeCard(cardId);
      return this.status;
    }
  }

  setAvatar(url) {
    this._token = localStorage.getItem("token");
    return fetch(`${this._url}/users/me/avatar`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this._token}`,
      },
      body: JSON.stringify({
        avatar: url.avatar,
      }),
    }).then(this._getResponseData);
  }
}

const api = new Api("https://api.mesto.viznyi.front.nomoredomains.work");

export { api };
