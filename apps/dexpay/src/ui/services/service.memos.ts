import type { Memo } from '../types';
import { $api } from './client';

export default abstract class MemosService {
  private static readonly PREFIX = 'memos';

  static beginImport(json: Memo.BeginImport.Body) {
    return $api.post(`${MemosService.PREFIX}/import`, { json }).json<Memo.BeginImport.Response>();
  }

  static completeImport(json: Memo.CompleteImport.Body) {
    return $api
      .patch(`${MemosService.PREFIX}/import`, { json })
      .json<Memo.CompleteImport.Response>();
  }

  static my(query: Memo.My.Query) {
    return $api.get(`${MemosService.PREFIX}/my`, { searchParams: query }).json<Memo.My.Response>();
  }
}
