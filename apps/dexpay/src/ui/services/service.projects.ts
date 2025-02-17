import type { Project } from '../types';
import { $api } from './client';

export default abstract class ProjectService {
  private static readonly PREFIX = 'projects';

  static my(query: Project.My.Query) {
    return $api
      .get(`${ProjectService.PREFIX}/my`, {
        searchParams: new URLSearchParams(query),
      })
      .json<Project.My.Response>();
  }

  static delete(params: Project.Delete.Params) {
    return $api
      .delete(`${ProjectService.PREFIX}/${params.id}`)
      .json<Project.Delete.Response>();
  }

  static update(params: Project.Update.Params, json: Project.Update.Body) {
    return $api
      .put(`${ProjectService.PREFIX}/${params.id}`, { json })
      .json<Project.Update.Response>();
  }

  static create(json: Project.Create.Body) {
    return $api
      .post(`${ProjectService.PREFIX}`, { json })
      .json<Project.Create.Response>();
  }

  static init(params: Project.Init.Params, json: Project.Init.Body) {
    return $api
      .post(`${ProjectService.PREFIX}/init/${params.id}`, { json })
      .json<Project.Init.Response>();
  }

  static inviteUser(
    params: Project.InviteUser.Params,
    json: Project.InviteUser.Body,
  ) {
    return $api
      .post(`${ProjectService.PREFIX}/${params.projectId}/invite-user`, {
        json,
      })
      .json<Project.InviteUser.Response>();
  }

  static getUsersWithAccess(params: Project.UsersWithAccess.Params) {
    return $api
      .get(`${ProjectService.PREFIX}/${params.projectId}/users-with-access`)
      .json<Project.UsersWithAccess.Response>();
  }

  static revokeAccess(params: Project.RevokeAccess.Params) {
    return $api
      .delete(
        `${ProjectService.PREFIX}/${params.projectId}/users-with-access/${params.userId}`,
      )
      .json<Project.RevokeAccess.Response>();
  }

  static setDrain(
    params: Project.SetDrain.Params,
    json: Project.SetDrain.Body,
  ) {
    return $api
      .put(`${ProjectService.PREFIX}/${params.id}/drain`, { json })
      .json<Project.SetDrain.Response>();
  }
}
