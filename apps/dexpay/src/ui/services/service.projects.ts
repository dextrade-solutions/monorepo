import type { Project } from '../types';
import { $api } from './client';

export default abstract class ProjectService {
  private static readonly PREFIX = 'projects';

  static my(query: Project.My.Query) {
    return $api
      .get(`${ProjectService.PREFIX}/my`, { searchParams: new URLSearchParams(query) })
      .json<Project.My.Response>();
  }

  static delete(params: Project.Delete.Params) {
    return $api.delete(`${ProjectService.PREFIX}/${params.id}`).json<Project.Delete.Response>();
  }

  static update(params: Project.Update.Params, json: Project.Update.Body) {
    return $api
      .put(`${ProjectService.PREFIX}/${params.id}`, { json })
      .json<Project.Update.Response>();
  }

  static create(json: Project.Create.Body) {
    return $api.post(`${ProjectService.PREFIX}`, { json }).json<Project.Create.Response>();
  }
}
