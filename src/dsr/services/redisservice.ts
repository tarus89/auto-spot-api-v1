import { createClient, RedisClientType } from "redis";

export default class RedisService {
  static client: RedisClientType;

  static async getConnection(): Promise<any> {
    if (RedisService.client != null) {
      return RedisService.client;
    }

    RedisService.client = createClient();

    RedisService.client.on("error", (err) =>
      console.log("Redis Client Error", err)
    );

    console.log("Redis connected successfully!");

    await RedisService.client.connect();

    return RedisService.client;
  }
}

type IResourceType = "idle" | "busy";
abstract class ResourceAble<T> {
  abstract close(): void;
}
class IResource<T, V> {
  id?: string;
  resource: ResourceAble<T>;
  resourceStorage: V;
  status: IResourceType; // idle | busy
  ttl?: number;
}

class ConnectionPooler<T> {
  maxActive: number = 10;
  pool: IResource<RedisClientType, number>[] = [];

  constructor(connections: IResource<RedisClientType, number>[], max: number) {
    this.pool = connections;
    this.maxActive = max;

    setInterval(() => {
      // if any resource has exceeded its ttl
      // ttl as current timestamp + 50 milliseconds
    }, 200);
  }

  // add resource
  add(rss: Array<IResource<RedisClientType, number>>) {
    rss = rss.map((rs) => {
      return { ...rs, id: "ewfrghj" };
    });
    this.pool = [...this.pool, ...rss];
  }

  // toggle resource status
  toggleStatus(rs: IResource<RedisClientType, number>) {
    this.pool.map((rsr) => {
      if (rsr.id == rs.id) {
        return {
          ...rsr,
          status: rsr.status == "idle" ? "busy" : "idle",
          ttl: null,
        };
      }
      return rsr;
    });
  }

  // get a not busy resource
  get(): IResource<RedisClientType, number> | null {
    const x = this.pool.find((rs) => rs.status == "idle") ?? null;
    if (x) {
      x.ttl = Date.now() + 50;
    }
    return x;
  }

  // create reasurce id
  createId(): string {
    return "ewrtfyhe";
  }
}

class DatabaseConnector {
  pooler: ConnectionPooler<RedisClientType>;

  constructor(connections: Array<IResource<RedisClientType, number>>) {
    this.pooler = new ConnectionPooler(connections, 9);
  }
}
