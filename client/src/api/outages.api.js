import api from './axiosInstance';

export const fetchOutages = (params) =>
  api.get('/outages', { params }).then(r => r.data.outages);

export const createOutage = (data) =>
  api.post('/outages', data).then(r => r.data.outage);

export const upvoteOutage = (id) =>
  api.patch(`/outages/${id}/upvote`).then(r => r.data);

export const updateStatus = (id, data) =>
  api.patch(`/outages/${id}/status`, data).then(r => r.data.outage);

export const fetchMyOutages = () =>
  api.get('/outages/my').then(r => r.data.outages);