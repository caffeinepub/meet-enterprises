var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
import { P as ProtocolError, T as TimeoutWaitingForResponseErrorCode, u as utf8ToBytes, E as ExternalError, M as MissingRootKeyErrorCode, C as Certificate, a as lookupResultToBuffer, R as RequestStatusResponseStatus, U as UnknownError, b as RequestStatusDoneNoReplyErrorCode, c as RejectError, d as CertifiedRejectErrorCode, e as UNREACHABLE_ERROR, I as InputError, f as InvalidReadStateRequestErrorCode, g as ReadRequestType, h as Principal, i as IDL, j as MissingCanisterIdErrorCode, H as HttpAgent, k as encode, Q as QueryResponseStatus, m as UncertifiedRejectErrorCode, n as isV3ResponseBody, o as isV2ResponseBody, p as UncertifiedRejectUpdateErrorCode, q as UnexpectedErrorCode, r as decode, s as Record, N as Nat, t as Text, v as Int, w as Principal$1, V as Vec, B as Bool, O as Opt, x as Nat8, F as Float64, S as Service, y as Func } from "./index-Crs6K7_N.js";
const FIVE_MINUTES_IN_MSEC = 5 * 60 * 1e3;
function defaultStrategy() {
  return chain(conditionalDelay(once(), 1e3), backoff(1e3, 1.2), timeout(FIVE_MINUTES_IN_MSEC));
}
function once() {
  let first = true;
  return async () => {
    if (first) {
      first = false;
      return true;
    }
    return false;
  };
}
function conditionalDelay(condition, timeInMsec) {
  return async (canisterId, requestId, status) => {
    if (await condition(canisterId, requestId, status)) {
      return new Promise((resolve) => setTimeout(resolve, timeInMsec));
    }
  };
}
function timeout(timeInMsec) {
  const end = Date.now() + timeInMsec;
  return async (_canisterId, requestId, status) => {
    if (Date.now() > end) {
      throw ProtocolError.fromCode(new TimeoutWaitingForResponseErrorCode(`Request timed out after ${timeInMsec} msec`, requestId, status));
    }
  };
}
function backoff(startingThrottleInMsec, backoffFactor) {
  let currentThrottling = startingThrottleInMsec;
  return () => new Promise((resolve) => setTimeout(() => {
    currentThrottling *= backoffFactor;
    resolve();
  }, currentThrottling));
}
function chain(...strategies) {
  return async (canisterId, requestId, status) => {
    for (const a of strategies) {
      await a(canisterId, requestId, status);
    }
  };
}
const DEFAULT_POLLING_OPTIONS = {
  preSignReadStateRequest: false
};
function hasProperty(value, property) {
  return Object.prototype.hasOwnProperty.call(value, property);
}
function isObjectWithProperty(value, property) {
  return value !== null && typeof value === "object" && hasProperty(value, property);
}
function hasFunction(value, property) {
  return hasProperty(value, property) && typeof value[property] === "function";
}
function isSignedReadStateRequestWithExpiry(value) {
  return isObjectWithProperty(value, "body") && isObjectWithProperty(value.body, "content") && value.body.content.request_type === ReadRequestType.ReadState && isObjectWithProperty(value.body.content, "ingress_expiry") && typeof value.body.content.ingress_expiry === "object" && value.body.content.ingress_expiry !== null && hasFunction(value.body.content.ingress_expiry, "toHash");
}
async function pollForResponse(agent, canisterId, requestId, options = {}) {
  const path = [utf8ToBytes("request_status"), requestId];
  let state;
  let currentRequest;
  const preSignReadStateRequest = options.preSignReadStateRequest ?? false;
  if (preSignReadStateRequest) {
    currentRequest = await constructRequest({
      paths: [path],
      agent,
      pollingOptions: options
    });
    state = await agent.readState(canisterId, { paths: [path] }, void 0, currentRequest);
  } else {
    state = await agent.readState(canisterId, { paths: [path] });
  }
  if (agent.rootKey == null) {
    throw ExternalError.fromCode(new MissingRootKeyErrorCode());
  }
  const cert = await Certificate.create({
    certificate: state.certificate,
    rootKey: agent.rootKey,
    canisterId,
    blsVerify: options.blsVerify,
    agent
  });
  const maybeBuf = lookupResultToBuffer(cert.lookup_path([...path, utf8ToBytes("status")]));
  let status;
  if (typeof maybeBuf === "undefined") {
    status = RequestStatusResponseStatus.Unknown;
  } else {
    status = new TextDecoder().decode(maybeBuf);
  }
  switch (status) {
    case RequestStatusResponseStatus.Replied: {
      return {
        reply: lookupResultToBuffer(cert.lookup_path([...path, "reply"])),
        certificate: cert
      };
    }
    case RequestStatusResponseStatus.Received:
    case RequestStatusResponseStatus.Unknown:
    case RequestStatusResponseStatus.Processing: {
      const strategy = options.strategy ?? defaultStrategy();
      await strategy(canisterId, requestId, status);
      return pollForResponse(agent, canisterId, requestId, {
        ...options,
        // Pass over either the strategy already provided or the new one created above
        strategy,
        request: currentRequest
      });
    }
    case RequestStatusResponseStatus.Rejected: {
      const rejectCode = new Uint8Array(lookupResultToBuffer(cert.lookup_path([...path, "reject_code"])))[0];
      const rejectMessage = new TextDecoder().decode(lookupResultToBuffer(cert.lookup_path([...path, "reject_message"])));
      const errorCodeBuf = lookupResultToBuffer(cert.lookup_path([...path, "error_code"]));
      const errorCode = errorCodeBuf ? new TextDecoder().decode(errorCodeBuf) : void 0;
      throw RejectError.fromCode(new CertifiedRejectErrorCode(requestId, rejectCode, rejectMessage, errorCode));
    }
    case RequestStatusResponseStatus.Done:
      throw UnknownError.fromCode(new RequestStatusDoneNoReplyErrorCode(requestId));
  }
  throw UNREACHABLE_ERROR;
}
async function constructRequest(options) {
  var _a;
  const { paths, agent, pollingOptions } = options;
  if (pollingOptions.request && isSignedReadStateRequestWithExpiry(pollingOptions.request)) {
    return pollingOptions.request;
  }
  const request = await ((_a = agent.createReadStateRequest) == null ? void 0 : _a.call(agent, {
    paths
  }, void 0));
  if (!isSignedReadStateRequestWithExpiry(request)) {
    throw InputError.fromCode(new InvalidReadStateRequestErrorCode(request));
  }
  return request;
}
const metadataSymbol = Symbol.for("ic-agent-metadata");
class Actor {
  /**
   * Get the Agent class this Actor would call, or undefined if the Actor would use
   * the default agent (global.ic.agent).
   * @param actor The actor to get the agent of.
   */
  static agentOf(actor) {
    return actor[metadataSymbol].config.agent;
  }
  /**
   * Get the interface of an actor, in the form of an instance of a Service.
   * @param actor The actor to get the interface of.
   */
  static interfaceOf(actor) {
    return actor[metadataSymbol].service;
  }
  static canisterIdOf(actor) {
    return Principal.from(actor[metadataSymbol].config.canisterId);
  }
  static createActorClass(interfaceFactory, options) {
    const service = interfaceFactory({ IDL });
    class CanisterActor extends Actor {
      constructor(config) {
        if (!config.canisterId) {
          throw InputError.fromCode(new MissingCanisterIdErrorCode(config.canisterId));
        }
        const canisterId = typeof config.canisterId === "string" ? Principal.fromText(config.canisterId) : config.canisterId;
        super({
          config: {
            ...DEFAULT_ACTOR_CONFIG,
            ...config,
            canisterId
          },
          service
        });
        for (const [methodName, func] of service._fields) {
          if (options == null ? void 0 : options.httpDetails) {
            func.annotations.push(ACTOR_METHOD_WITH_HTTP_DETAILS);
          }
          if (options == null ? void 0 : options.certificate) {
            func.annotations.push(ACTOR_METHOD_WITH_CERTIFICATE);
          }
          this[methodName] = _createActorMethod(this, methodName, func, config.blsVerify);
        }
      }
    }
    return CanisterActor;
  }
  /**
   * Creates an actor with the given interface factory and configuration.
   *
   * The [`@icp-sdk/bindgen`](https://js.icp.build/bindgen/) package can be used to generate the interface factory for your canister.
   * @param interfaceFactory - the interface factory for the actor, typically generated by the [`@icp-sdk/bindgen`](https://js.icp.build/bindgen/) package
   * @param configuration - the configuration for the actor
   * @returns an actor with the given interface factory and configuration
   * @example
   * Using the interface factory generated by the [`@icp-sdk/bindgen`](https://js.icp.build/bindgen/) package:
   * ```ts
   * import { Actor, HttpAgent } from '@icp-sdk/core/agent';
   * import { Principal } from '@icp-sdk/core/principal';
   * import { idlFactory } from './api/declarations/hello-world.did';
   *
   * const canisterId = Principal.fromText('rrkah-fqaaa-aaaaa-aaaaq-cai');
   *
   * const agent = await HttpAgent.create({
   *   host: 'https://icp-api.io',
   * });
   *
   * const actor = Actor.createActor(idlFactory, {
   *   agent,
   *   canisterId,
   * });
   *
   * const response = await actor.greet('world');
   * console.log(response);
   * ```
   * @example
   * Using the `createActor` wrapper function generated by the [`@icp-sdk/bindgen`](https://js.icp.build/bindgen/) package:
   * ```ts
   * import { HttpAgent } from '@icp-sdk/core/agent';
   * import { Principal } from '@icp-sdk/core/principal';
   * import { createActor } from './api/hello-world';
   *
   * const canisterId = Principal.fromText('rrkah-fqaaa-aaaaa-aaaaq-cai');
   *
   * const agent = await HttpAgent.create({
   *   host: 'https://icp-api.io',
   * });
   *
   * const actor = createActor(canisterId, {
   *   agent,
   * });
   *
   * const response = await actor.greet('world');
   * console.log(response);
   * ```
   */
  static createActor(interfaceFactory, configuration) {
    if (!configuration.canisterId) {
      throw InputError.fromCode(new MissingCanisterIdErrorCode(configuration.canisterId));
    }
    return new (this.createActorClass(interfaceFactory))(configuration);
  }
  /**
   * Returns an actor with methods that return the http response details along with the result
   * @param interfaceFactory - the interface factory for the actor
   * @param configuration - the configuration for the actor
   * @deprecated - use createActor with actorClassOptions instead
   */
  static createActorWithHttpDetails(interfaceFactory, configuration) {
    return new (this.createActorClass(interfaceFactory, { httpDetails: true }))(configuration);
  }
  /**
   * Returns an actor with methods that return the http response details along with the result
   * @param interfaceFactory - the interface factory for the actor
   * @param configuration - the configuration for the actor
   * @param actorClassOptions - options for the actor class extended details to return with the result
   */
  static createActorWithExtendedDetails(interfaceFactory, configuration, actorClassOptions = {
    httpDetails: true,
    certificate: true
  }) {
    return new (this.createActorClass(interfaceFactory, actorClassOptions))(configuration);
  }
  constructor(metadata) {
    this[metadataSymbol] = Object.freeze(metadata);
  }
}
function decodeReturnValue(types, msg) {
  const returnValues = decode(types, msg);
  switch (returnValues.length) {
    case 0:
      return void 0;
    case 1:
      return returnValues[0];
    default:
      return returnValues;
  }
}
const DEFAULT_ACTOR_CONFIG = {
  pollingOptions: DEFAULT_POLLING_OPTIONS
};
const ACTOR_METHOD_WITH_HTTP_DETAILS = "http-details";
const ACTOR_METHOD_WITH_CERTIFICATE = "certificate";
function _createActorMethod(actor, methodName, func, blsVerify) {
  let caller;
  if (func.annotations.includes("query") || func.annotations.includes("composite_query")) {
    caller = async (options, ...args) => {
      var _a, _b;
      options = {
        ...options,
        ...(_b = (_a = actor[metadataSymbol].config).queryTransform) == null ? void 0 : _b.call(_a, methodName, args, {
          ...actor[metadataSymbol].config,
          ...options
        })
      };
      const agent = options.agent || actor[metadataSymbol].config.agent || new HttpAgent();
      const cid = Principal.from(options.canisterId || actor[metadataSymbol].config.canisterId);
      const arg = encode(func.argTypes, args);
      const result = await agent.query(cid, {
        methodName,
        arg,
        effectiveCanisterId: options.effectiveCanisterId
      });
      const httpDetails = {
        ...result.httpDetails,
        requestDetails: result.requestDetails
      };
      switch (result.status) {
        case QueryResponseStatus.Rejected: {
          const uncertifiedRejectErrorCode = new UncertifiedRejectErrorCode(result.requestId, result.reject_code, result.reject_message, result.error_code, result.signatures);
          uncertifiedRejectErrorCode.callContext = {
            canisterId: cid,
            methodName,
            httpDetails
          };
          throw RejectError.fromCode(uncertifiedRejectErrorCode);
        }
        case QueryResponseStatus.Replied:
          return func.annotations.includes(ACTOR_METHOD_WITH_HTTP_DETAILS) ? {
            httpDetails,
            result: decodeReturnValue(func.retTypes, result.reply.arg)
          } : decodeReturnValue(func.retTypes, result.reply.arg);
      }
    };
  } else {
    caller = async (options, ...args) => {
      var _a, _b;
      options = {
        ...options,
        ...(_b = (_a = actor[metadataSymbol].config).callTransform) == null ? void 0 : _b.call(_a, methodName, args, {
          ...actor[metadataSymbol].config,
          ...options
        })
      };
      const agent = options.agent || actor[metadataSymbol].config.agent || HttpAgent.createSync();
      const { canisterId, effectiveCanisterId, pollingOptions } = {
        ...DEFAULT_ACTOR_CONFIG,
        ...actor[metadataSymbol].config,
        ...options
      };
      const cid = Principal.from(canisterId);
      const ecid = effectiveCanisterId !== void 0 ? Principal.from(effectiveCanisterId) : cid;
      const arg = encode(func.argTypes, args);
      const { requestId, response, requestDetails } = await agent.call(cid, {
        methodName,
        arg,
        effectiveCanisterId: ecid,
        nonce: options.nonce
      });
      let reply;
      let certificate;
      if (isV3ResponseBody(response.body)) {
        if (agent.rootKey == null) {
          throw ExternalError.fromCode(new MissingRootKeyErrorCode());
        }
        const cert = response.body.certificate;
        certificate = await Certificate.create({
          certificate: cert,
          rootKey: agent.rootKey,
          canisterId: ecid,
          blsVerify,
          agent
        });
        const path = [utf8ToBytes("request_status"), requestId];
        const status = new TextDecoder().decode(lookupResultToBuffer(certificate.lookup_path([...path, "status"])));
        switch (status) {
          case "replied":
            reply = lookupResultToBuffer(certificate.lookup_path([...path, "reply"]));
            break;
          case "rejected": {
            const rejectCode = new Uint8Array(lookupResultToBuffer(certificate.lookup_path([...path, "reject_code"])))[0];
            const rejectMessage = new TextDecoder().decode(lookupResultToBuffer(certificate.lookup_path([...path, "reject_message"])));
            const error_code_buf = lookupResultToBuffer(certificate.lookup_path([...path, "error_code"]));
            const error_code = error_code_buf ? new TextDecoder().decode(error_code_buf) : void 0;
            const certifiedRejectErrorCode = new CertifiedRejectErrorCode(requestId, rejectCode, rejectMessage, error_code);
            certifiedRejectErrorCode.callContext = {
              canisterId: cid,
              methodName,
              httpDetails: response
            };
            throw RejectError.fromCode(certifiedRejectErrorCode);
          }
        }
      } else if (isV2ResponseBody(response.body)) {
        const { reject_code, reject_message, error_code } = response.body;
        const errorCode = new UncertifiedRejectUpdateErrorCode(requestId, reject_code, reject_message, error_code);
        errorCode.callContext = {
          canisterId: cid,
          methodName,
          httpDetails: response
        };
        throw RejectError.fromCode(errorCode);
      }
      if (response.status === 202) {
        const pollOptions = {
          ...pollingOptions,
          blsVerify
        };
        const response2 = await pollForResponse(agent, ecid, requestId, pollOptions);
        certificate = response2.certificate;
        reply = response2.reply;
      }
      const shouldIncludeHttpDetails = func.annotations.includes(ACTOR_METHOD_WITH_HTTP_DETAILS);
      const shouldIncludeCertificate = func.annotations.includes(ACTOR_METHOD_WITH_CERTIFICATE);
      const httpDetails = { ...response, requestDetails };
      if (reply !== void 0) {
        if (shouldIncludeHttpDetails && shouldIncludeCertificate) {
          return {
            httpDetails,
            certificate,
            result: decodeReturnValue(func.retTypes, reply)
          };
        } else if (shouldIncludeCertificate) {
          return {
            certificate,
            result: decodeReturnValue(func.retTypes, reply)
          };
        } else if (shouldIncludeHttpDetails) {
          return {
            httpDetails,
            result: decodeReturnValue(func.retTypes, reply)
          };
        }
        return decodeReturnValue(func.retTypes, reply);
      } else {
        const errorCode = new UnexpectedErrorCode(`Call was returned undefined. We cannot determine if the call was successful or not. Return types: [${func.retTypes.map((t) => t.display()).join(",")}].`);
        errorCode.callContext = {
          canisterId: cid,
          methodName,
          httpDetails
        };
        throw UnknownError.fromCode(errorCode);
      }
    };
  }
  const handler = (...args) => caller({}, ...args);
  handler.withOptions = (options) => (...args) => caller(options, ...args);
  return handler;
}
const ReelComment = Record({
  "id": Nat,
  "userName": Text,
  "userId": Principal$1,
  "createdAt": Int,
  "text": Text,
  "reelId": Nat
});
const Category = Record({ "id": Nat, "name": Text });
const OrderItem = Record({
  "productId": Nat,
  "quantity": Nat,
  "price": Nat
});
const Order = Record({
  "id": Text,
  "status": Text,
  "paymentMethod": Text,
  "userId": Principal$1,
  "createdAt": Int,
  "deliveryLocation": Text,
  "totalAmount": Nat,
  "items": Vec(OrderItem)
});
const ProductSummary = Record({
  "id": Nat,
  "mrp": Nat,
  "categoryId": Nat,
  "inStock": Bool,
  "discountAmount": Nat,
  "name": Text,
  "description": Text,
  "sizes": Vec(Text),
  "colours": Vec(Text)
});
const Reel = Record({
  "id": Nat,
  "title": Text,
  "createdAt": Int,
  "productId": Opt(Nat),
  "videoUrl": Text
});
const Scheme = Record({
  "id": Nat,
  "couponCode": Text,
  "title": Text,
  "createdAt": Int,
  "description": Text
});
const UserProfile = Record({
  "id": Principal$1,
  "name": Text,
  "whatsapp": Text
});
const Voucher = Record({
  "id": Nat,
  "value": Nat,
  "code": Text,
  "userId": Principal$1,
  "createdAt": Int,
  "orderId": Text
});
const PaymentSettings = Record({
  "qrImage": Vec(Nat8),
  "qrImageType": Text,
  "upiId": Text
});
const Product = Record({
  "id": Nat,
  "mrp": Nat,
  "categoryId": Nat,
  "inStock": Bool,
  "imageType": Text,
  "discountAmount": Nat,
  "name": Text,
  "description": Text,
  "sizes": Vec(Text),
  "image": Vec(Nat8),
  "colours": Vec(Text)
});
const ProductImage = Record({
  "imageData": Vec(Nat8),
  "imageType": Text
});
const RatingSummary = Record({
  "count": Nat,
  "average": Float64
});
Service({
  "addProductImage": Func(
    [Text, Nat, Vec(Nat8), Text],
    [Nat],
    []
  ),
  "addReelComment": Func([Nat, Text], [ReelComment], []),
  "addToWishlist": Func([Nat], [], []),
  "createCategory": Func([Text, Text], [Category], []),
  "createOrder": Func(
    [Vec(OrderItem), Text, Text],
    [Order],
    []
  ),
  "createProduct": Func(
    [
      Text,
      Record({
        "mrp": Nat,
        "categoryId": Nat,
        "inStock": Bool,
        "imageType": Text,
        "discountAmount": Nat,
        "name": Text,
        "description": Text,
        "sizes": Vec(Text),
        "image": Vec(Nat8),
        "colours": Vec(Text)
      })
    ],
    [ProductSummary],
    []
  ),
  "createReel": Func(
    [Text, Text, Text, Opt(Nat)],
    [Reel],
    []
  ),
  "createScheme": Func(
    [Text, Text, Text, Text],
    [Scheme],
    []
  ),
  "deleteCategory": Func([Text, Nat], [], []),
  "deleteOrder": Func([Text, Text], [], []),
  "deleteProduct": Func([Text, Nat], [], []),
  "deleteReel": Func([Text, Nat], [], []),
  "deleteScheme": Func([Text, Nat], [], []),
  "generateDeliveryCode": Func([Text, Text], [Text], []),
  "getAllOrders": Func([Text], [Vec(Order)], []),
  "getAllUsers": Func([Text], [Vec(UserProfile)], []),
  "getAllVouchers": Func([Text], [Vec(Voucher)], []),
  "getCallerUserProfile": Func([], [Opt(UserProfile)], ["query"]),
  "getCategories": Func([], [Vec(Category)], ["query"]),
  "getDeliveryCode": Func([Text, Text], [Opt(Text)], []),
  "getInstagramHandle": Func([], [Text], ["query"]),
  "getOrderById": Func([Text], [Opt(Order)], ["query"]),
  "getOrderDeliveryCode": Func([Text], [Opt(Text)], ["query"]),
  "getPaymentSettings": Func([], [Opt(PaymentSettings)], ["query"]),
  "getProductById": Func([Nat], [Product], ["query"]),
  "getProductImages": Func([Nat], [Vec(ProductImage)], ["query"]),
  "getProductRating": Func([Nat], [RatingSummary], ["query"]),
  "getProducts": Func([], [Vec(ProductSummary)], ["query"]),
  "getReelComments": Func([Nat], [Vec(ReelComment)], ["query"]),
  "getReelLikeCount": Func([Nat], [Nat], ["query"]),
  "getReels": Func([], [Vec(Reel)], ["query"]),
  "getSchemes": Func([], [Vec(Scheme)], ["query"]),
  "getTheme": Func([], [Text], ["query"]),
  "getUserOrders": Func([Principal$1], [Vec(Order)], ["query"]),
  "getUserProductRating": Func([Nat], [Opt(Nat)], ["query"]),
  "getUserProfile": Func(
    [Principal$1],
    [Opt(UserProfile)],
    ["query"]
  ),
  "getUserVouchers": Func([Principal$1], [Vec(Voucher)], ["query"]),
  "getUserWishlist": Func([Principal$1], [Vec(Nat)], ["query"]),
  "isReelLiked": Func([Nat, Principal$1], [Bool], ["query"]),
  "likeReel": Func([Nat], [], []),
  "rateProduct": Func([Nat, Nat], [], []),
  "removeFromWishlist": Func([Nat], [], []),
  "removeProductImage": Func([Text, Nat, Nat], [], []),
  "saveCallerUserProfile": Func([Text, Text], [], []),
  "setInstagramHandle": Func([Text, Text], [], []),
  "setPaymentSettings": Func(
    [Text, Text, Vec(Nat8), Text],
    [],
    []
  ),
  "setTheme": Func([Text, Text], [], []),
  "unlikeReel": Func([Nat], [], []),
  "updateCategory": Func([Text, Nat, Text], [Category], []),
  "updateOrderStatus": Func([Text, Text, Text], [], []),
  "updateProduct": Func(
    [
      Text,
      Nat,
      Record({
        "mrp": Nat,
        "categoryId": Nat,
        "inStock": Bool,
        "imageType": Text,
        "discountAmount": Nat,
        "name": Text,
        "description": Text,
        "sizes": Vec(Text),
        "image": Vec(Nat8),
        "colours": Vec(Text)
      })
    ],
    [ProductSummary],
    []
  ),
  "verifyDeliveryCode": Func([Text, Text], [Bool], [])
});
const idlFactory = ({ IDL: IDL2 }) => {
  const ReelComment2 = IDL2.Record({
    "id": IDL2.Nat,
    "userName": IDL2.Text,
    "userId": IDL2.Principal,
    "createdAt": IDL2.Int,
    "text": IDL2.Text,
    "reelId": IDL2.Nat
  });
  const Category2 = IDL2.Record({ "id": IDL2.Nat, "name": IDL2.Text });
  const OrderItem2 = IDL2.Record({
    "productId": IDL2.Nat,
    "quantity": IDL2.Nat,
    "price": IDL2.Nat
  });
  const Order2 = IDL2.Record({
    "id": IDL2.Text,
    "status": IDL2.Text,
    "paymentMethod": IDL2.Text,
    "userId": IDL2.Principal,
    "createdAt": IDL2.Int,
    "deliveryLocation": IDL2.Text,
    "totalAmount": IDL2.Nat,
    "items": IDL2.Vec(OrderItem2)
  });
  const ProductSummary2 = IDL2.Record({
    "id": IDL2.Nat,
    "mrp": IDL2.Nat,
    "categoryId": IDL2.Nat,
    "inStock": IDL2.Bool,
    "discountAmount": IDL2.Nat,
    "name": IDL2.Text,
    "description": IDL2.Text,
    "sizes": IDL2.Vec(IDL2.Text),
    "colours": IDL2.Vec(IDL2.Text)
  });
  const Reel2 = IDL2.Record({
    "id": IDL2.Nat,
    "title": IDL2.Text,
    "createdAt": IDL2.Int,
    "productId": IDL2.Opt(IDL2.Nat),
    "videoUrl": IDL2.Text
  });
  const Scheme2 = IDL2.Record({
    "id": IDL2.Nat,
    "couponCode": IDL2.Text,
    "title": IDL2.Text,
    "createdAt": IDL2.Int,
    "description": IDL2.Text
  });
  const UserProfile2 = IDL2.Record({
    "id": IDL2.Principal,
    "name": IDL2.Text,
    "whatsapp": IDL2.Text
  });
  const Voucher2 = IDL2.Record({
    "id": IDL2.Nat,
    "value": IDL2.Nat,
    "code": IDL2.Text,
    "userId": IDL2.Principal,
    "createdAt": IDL2.Int,
    "orderId": IDL2.Text
  });
  const PaymentSettings2 = IDL2.Record({
    "qrImage": IDL2.Vec(IDL2.Nat8),
    "qrImageType": IDL2.Text,
    "upiId": IDL2.Text
  });
  const Product2 = IDL2.Record({
    "id": IDL2.Nat,
    "mrp": IDL2.Nat,
    "categoryId": IDL2.Nat,
    "inStock": IDL2.Bool,
    "imageType": IDL2.Text,
    "discountAmount": IDL2.Nat,
    "name": IDL2.Text,
    "description": IDL2.Text,
    "sizes": IDL2.Vec(IDL2.Text),
    "image": IDL2.Vec(IDL2.Nat8),
    "colours": IDL2.Vec(IDL2.Text)
  });
  const ProductImage2 = IDL2.Record({
    "imageData": IDL2.Vec(IDL2.Nat8),
    "imageType": IDL2.Text
  });
  const RatingSummary2 = IDL2.Record({
    "count": IDL2.Nat,
    "average": IDL2.Float64
  });
  return IDL2.Service({
    "addProductImage": IDL2.Func(
      [IDL2.Text, IDL2.Nat, IDL2.Vec(IDL2.Nat8), IDL2.Text],
      [IDL2.Nat],
      []
    ),
    "addReelComment": IDL2.Func([IDL2.Nat, IDL2.Text], [ReelComment2], []),
    "addToWishlist": IDL2.Func([IDL2.Nat], [], []),
    "createCategory": IDL2.Func([IDL2.Text, IDL2.Text], [Category2], []),
    "createOrder": IDL2.Func(
      [IDL2.Vec(OrderItem2), IDL2.Text, IDL2.Text],
      [Order2],
      []
    ),
    "createProduct": IDL2.Func(
      [
        IDL2.Text,
        IDL2.Record({
          "mrp": IDL2.Nat,
          "categoryId": IDL2.Nat,
          "inStock": IDL2.Bool,
          "imageType": IDL2.Text,
          "discountAmount": IDL2.Nat,
          "name": IDL2.Text,
          "description": IDL2.Text,
          "sizes": IDL2.Vec(IDL2.Text),
          "image": IDL2.Vec(IDL2.Nat8),
          "colours": IDL2.Vec(IDL2.Text)
        })
      ],
      [ProductSummary2],
      []
    ),
    "createReel": IDL2.Func(
      [IDL2.Text, IDL2.Text, IDL2.Text, IDL2.Opt(IDL2.Nat)],
      [Reel2],
      []
    ),
    "createScheme": IDL2.Func(
      [IDL2.Text, IDL2.Text, IDL2.Text, IDL2.Text],
      [Scheme2],
      []
    ),
    "deleteCategory": IDL2.Func([IDL2.Text, IDL2.Nat], [], []),
    "deleteOrder": IDL2.Func([IDL2.Text, IDL2.Text], [], []),
    "deleteProduct": IDL2.Func([IDL2.Text, IDL2.Nat], [], []),
    "deleteReel": IDL2.Func([IDL2.Text, IDL2.Nat], [], []),
    "deleteScheme": IDL2.Func([IDL2.Text, IDL2.Nat], [], []),
    "generateDeliveryCode": IDL2.Func([IDL2.Text, IDL2.Text], [IDL2.Text], []),
    "getAllOrders": IDL2.Func([IDL2.Text], [IDL2.Vec(Order2)], []),
    "getAllUsers": IDL2.Func([IDL2.Text], [IDL2.Vec(UserProfile2)], []),
    "getAllVouchers": IDL2.Func([IDL2.Text], [IDL2.Vec(Voucher2)], []),
    "getCallerUserProfile": IDL2.Func([], [IDL2.Opt(UserProfile2)], ["query"]),
    "getCategories": IDL2.Func([], [IDL2.Vec(Category2)], ["query"]),
    "getDeliveryCode": IDL2.Func([IDL2.Text, IDL2.Text], [IDL2.Opt(IDL2.Text)], []),
    "getInstagramHandle": IDL2.Func([], [IDL2.Text], ["query"]),
    "getOrderById": IDL2.Func([IDL2.Text], [IDL2.Opt(Order2)], ["query"]),
    "getOrderDeliveryCode": IDL2.Func(
      [IDL2.Text],
      [IDL2.Opt(IDL2.Text)],
      ["query"]
    ),
    "getPaymentSettings": IDL2.Func([], [IDL2.Opt(PaymentSettings2)], ["query"]),
    "getProductById": IDL2.Func([IDL2.Nat], [Product2], ["query"]),
    "getProductImages": IDL2.Func(
      [IDL2.Nat],
      [IDL2.Vec(ProductImage2)],
      ["query"]
    ),
    "getProductRating": IDL2.Func([IDL2.Nat], [RatingSummary2], ["query"]),
    "getProducts": IDL2.Func([], [IDL2.Vec(ProductSummary2)], ["query"]),
    "getReelComments": IDL2.Func([IDL2.Nat], [IDL2.Vec(ReelComment2)], ["query"]),
    "getReelLikeCount": IDL2.Func([IDL2.Nat], [IDL2.Nat], ["query"]),
    "getReels": IDL2.Func([], [IDL2.Vec(Reel2)], ["query"]),
    "getSchemes": IDL2.Func([], [IDL2.Vec(Scheme2)], ["query"]),
    "getTheme": IDL2.Func([], [IDL2.Text], ["query"]),
    "getUserOrders": IDL2.Func([IDL2.Principal], [IDL2.Vec(Order2)], ["query"]),
    "getUserProductRating": IDL2.Func([IDL2.Nat], [IDL2.Opt(IDL2.Nat)], ["query"]),
    "getUserProfile": IDL2.Func(
      [IDL2.Principal],
      [IDL2.Opt(UserProfile2)],
      ["query"]
    ),
    "getUserVouchers": IDL2.Func(
      [IDL2.Principal],
      [IDL2.Vec(Voucher2)],
      ["query"]
    ),
    "getUserWishlist": IDL2.Func(
      [IDL2.Principal],
      [IDL2.Vec(IDL2.Nat)],
      ["query"]
    ),
    "isReelLiked": IDL2.Func([IDL2.Nat, IDL2.Principal], [IDL2.Bool], ["query"]),
    "likeReel": IDL2.Func([IDL2.Nat], [], []),
    "rateProduct": IDL2.Func([IDL2.Nat, IDL2.Nat], [], []),
    "removeFromWishlist": IDL2.Func([IDL2.Nat], [], []),
    "removeProductImage": IDL2.Func([IDL2.Text, IDL2.Nat, IDL2.Nat], [], []),
    "saveCallerUserProfile": IDL2.Func([IDL2.Text, IDL2.Text], [], []),
    "setInstagramHandle": IDL2.Func([IDL2.Text, IDL2.Text], [], []),
    "setPaymentSettings": IDL2.Func(
      [IDL2.Text, IDL2.Text, IDL2.Vec(IDL2.Nat8), IDL2.Text],
      [],
      []
    ),
    "setTheme": IDL2.Func([IDL2.Text, IDL2.Text], [], []),
    "unlikeReel": IDL2.Func([IDL2.Nat], [], []),
    "updateCategory": IDL2.Func([IDL2.Text, IDL2.Nat, IDL2.Text], [Category2], []),
    "updateOrderStatus": IDL2.Func([IDL2.Text, IDL2.Text, IDL2.Text], [], []),
    "updateProduct": IDL2.Func(
      [
        IDL2.Text,
        IDL2.Nat,
        IDL2.Record({
          "mrp": IDL2.Nat,
          "categoryId": IDL2.Nat,
          "inStock": IDL2.Bool,
          "imageType": IDL2.Text,
          "discountAmount": IDL2.Nat,
          "name": IDL2.Text,
          "description": IDL2.Text,
          "sizes": IDL2.Vec(IDL2.Text),
          "image": IDL2.Vec(IDL2.Nat8),
          "colours": IDL2.Vec(IDL2.Text)
        })
      ],
      [ProductSummary2],
      []
    ),
    "verifyDeliveryCode": IDL2.Func([IDL2.Text, IDL2.Text], [IDL2.Bool], [])
  });
};
function candid_some(value) {
  return [
    value
  ];
}
function candid_none() {
  return [];
}
function record_opt_to_undefined(arg) {
  return arg == null ? void 0 : arg;
}
class ExternalBlob {
  constructor(directURL, blob) {
    __publicField(this, "_blob");
    __publicField(this, "directURL");
    __publicField(this, "onProgress");
    if (blob) {
      this._blob = blob;
    }
    this.directURL = directURL;
  }
  static fromURL(url) {
    return new ExternalBlob(url, null);
  }
  static fromBytes(blob) {
    const url = URL.createObjectURL(new Blob([
      new Uint8Array(blob)
    ], {
      type: "application/octet-stream"
    }));
    return new ExternalBlob(url, blob);
  }
  async getBytes() {
    if (this._blob) {
      return this._blob;
    }
    const response = await fetch(this.directURL);
    const blob = await response.blob();
    this._blob = new Uint8Array(await blob.arrayBuffer());
    return this._blob;
  }
  getDirectURL() {
    return this.directURL;
  }
  withUploadProgress(onProgress) {
    this.onProgress = onProgress;
    return this;
  }
}
class Backend {
  constructor(actor, _uploadFile, _downloadFile, processError) {
    this.actor = actor;
    this._uploadFile = _uploadFile;
    this._downloadFile = _downloadFile;
    this.processError = processError;
  }
  async addProductImage(arg0, arg1, arg2, arg3) {
    if (this.processError) {
      try {
        const result = await this.actor.addProductImage(arg0, arg1, arg2, arg3);
        return result;
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.addProductImage(arg0, arg1, arg2, arg3);
      return result;
    }
  }
  async addReelComment(arg0, arg1) {
    if (this.processError) {
      try {
        const result = await this.actor.addReelComment(arg0, arg1);
        return result;
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.addReelComment(arg0, arg1);
      return result;
    }
  }
  async addToWishlist(arg0) {
    if (this.processError) {
      try {
        const result = await this.actor.addToWishlist(arg0);
        return result;
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.addToWishlist(arg0);
      return result;
    }
  }
  async createCategory(arg0, arg1) {
    if (this.processError) {
      try {
        const result = await this.actor.createCategory(arg0, arg1);
        return result;
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.createCategory(arg0, arg1);
      return result;
    }
  }
  async createOrder(arg0, arg1, arg2) {
    if (this.processError) {
      try {
        const result = await this.actor.createOrder(arg0, arg1, arg2);
        return result;
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.createOrder(arg0, arg1, arg2);
      return result;
    }
  }
  async createProduct(arg0, arg1) {
    if (this.processError) {
      try {
        const result = await this.actor.createProduct(arg0, arg1);
        return result;
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.createProduct(arg0, arg1);
      return result;
    }
  }
  async createReel(arg0, arg1, arg2, arg3) {
    if (this.processError) {
      try {
        const result = await this.actor.createReel(arg0, arg1, arg2, to_candid_opt_n1(this._uploadFile, this._downloadFile, arg3));
        return from_candid_Reel_n2(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.createReel(arg0, arg1, arg2, to_candid_opt_n1(this._uploadFile, this._downloadFile, arg3));
      return from_candid_Reel_n2(this._uploadFile, this._downloadFile, result);
    }
  }
  async createScheme(arg0, arg1, arg2, arg3) {
    if (this.processError) {
      try {
        const result = await this.actor.createScheme(arg0, arg1, arg2, arg3);
        return result;
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.createScheme(arg0, arg1, arg2, arg3);
      return result;
    }
  }
  async deleteCategory(arg0, arg1) {
    if (this.processError) {
      try {
        const result = await this.actor.deleteCategory(arg0, arg1);
        return result;
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.deleteCategory(arg0, arg1);
      return result;
    }
  }
  async deleteOrder(arg0, arg1) {
    if (this.processError) {
      try {
        const result = await this.actor.deleteOrder(arg0, arg1);
        return result;
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.deleteOrder(arg0, arg1);
      return result;
    }
  }
  async deleteProduct(arg0, arg1) {
    if (this.processError) {
      try {
        const result = await this.actor.deleteProduct(arg0, arg1);
        return result;
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.deleteProduct(arg0, arg1);
      return result;
    }
  }
  async deleteReel(arg0, arg1) {
    if (this.processError) {
      try {
        const result = await this.actor.deleteReel(arg0, arg1);
        return result;
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.deleteReel(arg0, arg1);
      return result;
    }
  }
  async deleteScheme(arg0, arg1) {
    if (this.processError) {
      try {
        const result = await this.actor.deleteScheme(arg0, arg1);
        return result;
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.deleteScheme(arg0, arg1);
      return result;
    }
  }
  async generateDeliveryCode(arg0, arg1) {
    if (this.processError) {
      try {
        const result = await this.actor.generateDeliveryCode(arg0, arg1);
        return result;
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.generateDeliveryCode(arg0, arg1);
      return result;
    }
  }
  async getAllOrders(arg0) {
    if (this.processError) {
      try {
        const result = await this.actor.getAllOrders(arg0);
        return result;
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.getAllOrders(arg0);
      return result;
    }
  }
  async getAllUsers(arg0) {
    if (this.processError) {
      try {
        const result = await this.actor.getAllUsers(arg0);
        return result;
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.getAllUsers(arg0);
      return result;
    }
  }
  async getAllVouchers(arg0) {
    if (this.processError) {
      try {
        const result = await this.actor.getAllVouchers(arg0);
        return result;
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.getAllVouchers(arg0);
      return result;
    }
  }
  async getCallerUserProfile() {
    if (this.processError) {
      try {
        const result = await this.actor.getCallerUserProfile();
        return from_candid_opt_n5(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.getCallerUserProfile();
      return from_candid_opt_n5(this._uploadFile, this._downloadFile, result);
    }
  }
  async getCategories() {
    if (this.processError) {
      try {
        const result = await this.actor.getCategories();
        return result;
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.getCategories();
      return result;
    }
  }
  async getDeliveryCode(arg0, arg1) {
    if (this.processError) {
      try {
        const result = await this.actor.getDeliveryCode(arg0, arg1);
        return from_candid_opt_n6(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.getDeliveryCode(arg0, arg1);
      return from_candid_opt_n6(this._uploadFile, this._downloadFile, result);
    }
  }
  async getInstagramHandle() {
    if (this.processError) {
      try {
        const result = await this.actor.getInstagramHandle();
        return result;
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.getInstagramHandle();
      return result;
    }
  }
  async getOrderById(arg0) {
    if (this.processError) {
      try {
        const result = await this.actor.getOrderById(arg0);
        return from_candid_opt_n7(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.getOrderById(arg0);
      return from_candid_opt_n7(this._uploadFile, this._downloadFile, result);
    }
  }
  async getOrderDeliveryCode(arg0) {
    if (this.processError) {
      try {
        const result = await this.actor.getOrderDeliveryCode(arg0);
        return from_candid_opt_n6(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.getOrderDeliveryCode(arg0);
      return from_candid_opt_n6(this._uploadFile, this._downloadFile, result);
    }
  }
  async getPaymentSettings() {
    if (this.processError) {
      try {
        const result = await this.actor.getPaymentSettings();
        return from_candid_opt_n8(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.getPaymentSettings();
      return from_candid_opt_n8(this._uploadFile, this._downloadFile, result);
    }
  }
  async getProductById(arg0) {
    if (this.processError) {
      try {
        const result = await this.actor.getProductById(arg0);
        return result;
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.getProductById(arg0);
      return result;
    }
  }
  async getProductImages(arg0) {
    if (this.processError) {
      try {
        const result = await this.actor.getProductImages(arg0);
        return result;
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.getProductImages(arg0);
      return result;
    }
  }
  async getProductRating(arg0) {
    if (this.processError) {
      try {
        const result = await this.actor.getProductRating(arg0);
        return result;
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.getProductRating(arg0);
      return result;
    }
  }
  async getProducts() {
    if (this.processError) {
      try {
        const result = await this.actor.getProducts();
        return result;
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.getProducts();
      return result;
    }
  }
  async getReelComments(arg0) {
    if (this.processError) {
      try {
        const result = await this.actor.getReelComments(arg0);
        return result;
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.getReelComments(arg0);
      return result;
    }
  }
  async getReelLikeCount(arg0) {
    if (this.processError) {
      try {
        const result = await this.actor.getReelLikeCount(arg0);
        return result;
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.getReelLikeCount(arg0);
      return result;
    }
  }
  async getReels() {
    if (this.processError) {
      try {
        const result = await this.actor.getReels();
        return from_candid_vec_n9(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.getReels();
      return from_candid_vec_n9(this._uploadFile, this._downloadFile, result);
    }
  }
  async getSchemes() {
    if (this.processError) {
      try {
        const result = await this.actor.getSchemes();
        return result;
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.getSchemes();
      return result;
    }
  }
  async getTheme() {
    if (this.processError) {
      try {
        const result = await this.actor.getTheme();
        return result;
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.getTheme();
      return result;
    }
  }
  async getUserOrders(arg0) {
    if (this.processError) {
      try {
        const result = await this.actor.getUserOrders(arg0);
        return result;
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.getUserOrders(arg0);
      return result;
    }
  }
  async getUserProductRating(arg0) {
    if (this.processError) {
      try {
        const result = await this.actor.getUserProductRating(arg0);
        return from_candid_opt_n4(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.getUserProductRating(arg0);
      return from_candid_opt_n4(this._uploadFile, this._downloadFile, result);
    }
  }
  async getUserProfile(arg0) {
    if (this.processError) {
      try {
        const result = await this.actor.getUserProfile(arg0);
        return from_candid_opt_n5(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.getUserProfile(arg0);
      return from_candid_opt_n5(this._uploadFile, this._downloadFile, result);
    }
  }
  async getUserVouchers(arg0) {
    if (this.processError) {
      try {
        const result = await this.actor.getUserVouchers(arg0);
        return result;
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.getUserVouchers(arg0);
      return result;
    }
  }
  async getUserWishlist(arg0) {
    if (this.processError) {
      try {
        const result = await this.actor.getUserWishlist(arg0);
        return result;
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.getUserWishlist(arg0);
      return result;
    }
  }
  async isReelLiked(arg0, arg1) {
    if (this.processError) {
      try {
        const result = await this.actor.isReelLiked(arg0, arg1);
        return result;
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.isReelLiked(arg0, arg1);
      return result;
    }
  }
  async likeReel(arg0) {
    if (this.processError) {
      try {
        const result = await this.actor.likeReel(arg0);
        return result;
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.likeReel(arg0);
      return result;
    }
  }
  async rateProduct(arg0, arg1) {
    if (this.processError) {
      try {
        const result = await this.actor.rateProduct(arg0, arg1);
        return result;
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.rateProduct(arg0, arg1);
      return result;
    }
  }
  async removeFromWishlist(arg0) {
    if (this.processError) {
      try {
        const result = await this.actor.removeFromWishlist(arg0);
        return result;
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.removeFromWishlist(arg0);
      return result;
    }
  }
  async removeProductImage(arg0, arg1, arg2) {
    if (this.processError) {
      try {
        const result = await this.actor.removeProductImage(arg0, arg1, arg2);
        return result;
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.removeProductImage(arg0, arg1, arg2);
      return result;
    }
  }
  async saveCallerUserProfile(arg0, arg1) {
    if (this.processError) {
      try {
        const result = await this.actor.saveCallerUserProfile(arg0, arg1);
        return result;
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.saveCallerUserProfile(arg0, arg1);
      return result;
    }
  }
  async setInstagramHandle(arg0, arg1) {
    if (this.processError) {
      try {
        const result = await this.actor.setInstagramHandle(arg0, arg1);
        return result;
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.setInstagramHandle(arg0, arg1);
      return result;
    }
  }
  async setPaymentSettings(arg0, arg1, arg2, arg3) {
    if (this.processError) {
      try {
        const result = await this.actor.setPaymentSettings(arg0, arg1, arg2, arg3);
        return result;
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.setPaymentSettings(arg0, arg1, arg2, arg3);
      return result;
    }
  }
  async setTheme(arg0, arg1) {
    if (this.processError) {
      try {
        const result = await this.actor.setTheme(arg0, arg1);
        return result;
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.setTheme(arg0, arg1);
      return result;
    }
  }
  async unlikeReel(arg0) {
    if (this.processError) {
      try {
        const result = await this.actor.unlikeReel(arg0);
        return result;
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.unlikeReel(arg0);
      return result;
    }
  }
  async updateCategory(arg0, arg1, arg2) {
    if (this.processError) {
      try {
        const result = await this.actor.updateCategory(arg0, arg1, arg2);
        return result;
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.updateCategory(arg0, arg1, arg2);
      return result;
    }
  }
  async updateOrderStatus(arg0, arg1, arg2) {
    if (this.processError) {
      try {
        const result = await this.actor.updateOrderStatus(arg0, arg1, arg2);
        return result;
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.updateOrderStatus(arg0, arg1, arg2);
      return result;
    }
  }
  async updateProduct(arg0, arg1, arg2) {
    if (this.processError) {
      try {
        const result = await this.actor.updateProduct(arg0, arg1, arg2);
        return result;
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.updateProduct(arg0, arg1, arg2);
      return result;
    }
  }
  async verifyDeliveryCode(arg0, arg1) {
    if (this.processError) {
      try {
        const result = await this.actor.verifyDeliveryCode(arg0, arg1);
        return result;
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.verifyDeliveryCode(arg0, arg1);
      return result;
    }
  }
}
function from_candid_Reel_n2(_uploadFile, _downloadFile, value) {
  return from_candid_record_n3(_uploadFile, _downloadFile, value);
}
function from_candid_opt_n4(_uploadFile, _downloadFile, value) {
  return value.length === 0 ? null : value[0];
}
function from_candid_opt_n5(_uploadFile, _downloadFile, value) {
  return value.length === 0 ? null : value[0];
}
function from_candid_opt_n6(_uploadFile, _downloadFile, value) {
  return value.length === 0 ? null : value[0];
}
function from_candid_opt_n7(_uploadFile, _downloadFile, value) {
  return value.length === 0 ? null : value[0];
}
function from_candid_opt_n8(_uploadFile, _downloadFile, value) {
  return value.length === 0 ? null : value[0];
}
function from_candid_record_n3(_uploadFile, _downloadFile, value) {
  return {
    id: value.id,
    title: value.title,
    createdAt: value.createdAt,
    productId: record_opt_to_undefined(from_candid_opt_n4(_uploadFile, _downloadFile, value.productId)),
    videoUrl: value.videoUrl
  };
}
function from_candid_vec_n9(_uploadFile, _downloadFile, value) {
  return value.map((x) => from_candid_Reel_n2(_uploadFile, _downloadFile, x));
}
function to_candid_opt_n1(_uploadFile, _downloadFile, value) {
  return value === null ? candid_none() : candid_some(value);
}
function createActor(canisterId, _uploadFile, _downloadFile, options = {}) {
  const agent = options.agent || HttpAgent.createSync({
    ...options.agentOptions
  });
  if (options.agent && options.agentOptions) {
    console.warn("Detected both agent and agentOptions passed to createActor. Ignoring agentOptions and proceeding with the provided agent.");
  }
  const actor = Actor.createActor(idlFactory, {
    agent,
    canisterId,
    ...options.actorOptions
  });
  return new Backend(actor, _uploadFile, _downloadFile, options.processError);
}
export {
  Backend,
  ExternalBlob,
  createActor
};
