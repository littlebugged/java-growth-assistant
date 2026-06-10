import type { DimensionStageTemplate } from '../types'

/**
 * 维度阶段模板库
 * 6 维度 × 3 级跃迁 = 18 个模板
 * 每个模板包含 8-10 个细化学习主题
 */
export const dimensionStageTemplates: DimensionStageTemplate[] = [

  // ============================================================
  //                    Java 基础 (javaBasics)
  // ============================================================

  {
    dimension: 'javaBasics',
    fromLevel: 'junior',
    toLevel: 'intermediate',
    title: 'Java 核心深化',
    description: '从「会用 API」到「理解原理」，建立扎实的 Java 语言功底',
    estimatedDays: 14,
    topics: [
      '集合框架源码精读：HashMap 底层结构、哈希冲突解决、红黑树转换阈值',
      '集合框架源码精读：ArrayList 扩容机制、LinkedList 适用场景对比',
      'ConcurrentHashMap 分段锁 vs CAS 原理',
      '异常体系：Checked vs Unchecked、异常链、自定义异常最佳实践',
      '泛型深入：类型擦除机制、通配符 PECS 原则、泛型方法与泛型类',
      'Stream API：惰性求值、短路操作、并行流陷阱',
      '函数式编程：Lambda 表达式、方法引用、Optional 正确用法',
      'Java 新特性：Records、Sealed Classes、Pattern Matching、Text Blocks',
      'String 深入：字符串常量池、String.intern()、StringBuilder 原理',
    ],
    projectTitle: '自定义集合框架',
    projectDesc: '手写一个简化版 HashMap：支持 put/get/remove，实现哈希冲突的链表法和红黑树法，对比性能差异',
    resources: [
      '《Effective Java》第 3 版 - Joshua Bloch',
      '《Java 核心技术 卷 I》集合框架章节',
      'Oracle 官方 Java Tutorials - Collections',
    ],
  },

  {
    dimension: 'javaBasics',
    fromLevel: 'intermediate',
    toLevel: 'senior',
    title: 'Java 高级特性与性能调优',
    description: '掌握 Java 语言的高级机制，具备性能分析和调优能力',
    estimatedDays: 18,
    topics: [
      'Java 内存模型（JMM）：happens-before 规则、内存屏障、volatile 语义',
      '反射机制：Class 加载流程、Method.invoke 性能优化、动态代理',
      '注解处理：编译时注解（APT）、运行时注解、自定义注解处理器',
      'SPI 机制：ServiceLoader 原理、类加载器与 SPI 的冲突',
      'Java Agent：字节码增强、Instrumentation API、JVMTI',
      '序列化对比：JDK 序列化、Protobuf、Kryo、Hessian 性能与适用场景',
      'Java 性能分析工具：JFR、async-profiler、Arthas 实战',
      '代码优化：对象池、缓存友好、减少锁竞争、避免 GC 压力',
      'Java 17/21 LTS 新特性：Virtual Threads、Switch Expressions、Vector API',
    ],
    projectTitle: '字节码增强工具',
    projectDesc: '基于 Java Agent + ASM 实现一个方法耗时统计工具，自动注入耗时采集逻辑，支持动态开关',
    resources: [
      '《Java 并发编程的艺术》- 方腾飞',
      '《深入理解 Java 虚拟机》第 3 版 - 周志明',
      'Oracle JEP 索引',
    ],
  },

  {
    dimension: 'javaBasics',
    fromLevel: 'senior',
    toLevel: 'expert',
    title: 'Java 语言设计与生态洞察',
    description: '理解 Java 语言设计哲学，跟踪前沿演进方向',
    estimatedDays: 14,
    topics: [
      'Java 语言规范（JLS）精读：类型系统、表达式求值、异常处理规范',
      'Java 范型系统设计：通配符捕获、F-bounded 多态、自我类型',
      '值类型与 Project Valhalla：内联类、扁平化内存布局',
      'Project Loom 深入：Virtual Threads 原理、Structured Concurrency、Scoped Values',
      'Project Panama：Foreign Function & Memory API、向量化计算',
      'GraalVM 与 Native Image：AOT 编译原理、Substrate VM、反射配置',
      'Java 生态趋势：Spring Boot 3、Quarkus、Micronaut 框架对比',
      '多语言 JVM：Kotlin 协程、Scala ZIO 对 Java 生态的影响',
    ],
    projectTitle: '迷你编译器前端',
    projectDesc: '实现一个简化版 Java 表达式编译器：词法分析、语法分析、AST 构建、字节码生成',
    resources: [
      '《Java Language Specification》',
      'OpenJDK 项目文档（Valhalla/Loom/Panama）',
      'InfoQ Java 趋势报告',
    ],
  },

  // ============================================================
  //                       JVM (jvm)
  // ============================================================

  {
    dimension: 'jvm',
    fromLevel: 'junior',
    toLevel: 'intermediate',
    title: 'JVM 运行机制入门',
    description: '理解 JVM 如何运行 Java 程序，具备基本的线上问题排查能力',
    estimatedDays: 14,
    topics: [
      'JVM 内存模型：堆、栈、方法区、程序计数器各自职责',
      '对象创建与内存分配：TLAB、指针碰撞、空闲列表',
      '垃圾回收算法：标记-清除、标记-整理、复制算法原理与对比',
      '垃圾回收器：Serial、Parallel、CMS、G1 各自特点与适用场景',
      '类加载机制：加载→验证→准备→解析→初始化全流程',
      '双亲委派模型：为什么需要、如何打破、SPI 场景',
      'JVM 参数调优：-Xms/-Xmx/-Xss/-XX:MetaspaceSize 常用配置',
      'GC 日志解读：-Xlog:gc* 格式、关键指标含义',
      '线上 OOM 排查：heap dump 分析、MAT 工具使用',
    ],
    projectTitle: 'GC 日志分析器',
    projectDesc: '解析 JVM GC 日志，用图表展示 GC 频率、停顿时间、内存变化趋势，识别潜在问题',
    resources: [
      '《深入理解 Java 虚拟机》第 3 版 - 周志明',
      'Oracle JVM 规范',
      'Baeldung JVM 系列教程',
    ],
  },

  {
    dimension: 'jvm',
    fromLevel: 'intermediate',
    toLevel: 'senior',
    title: 'JVM 深度调优与实战',
    description: '掌握 JVM 底层原理，具备生产环境性能调优和疑难问题排查能力',
    estimatedDays: 21,
    topics: [
      'G1 回收器深入：Region 划分、Humongous 对象、Mixed GC 触发条件',
      'ZGC 原理：染色指针、读屏障、并发整理、亚毫秒停顿',
      'Shenandoah 回收器：Brooks Pointer、并发压缩',
      'JIT 编译：C1/C2 编译器、方法内联、逃逸分析、栈上分配',
      'JMH 基准测试：微基准测试编写、避免 JIT 优化陷阱',
      '线上 CPU 飙高排查：jstack 线程分析、火焰图生成与解读',
      '内存泄漏排查：jmap/jhat/MAT 实战、Dominator Tree 分析',
      '类加载冲突排查：不同 ClassLoader 加载相同类导致的 Cast 异常',
      'JVM 与容器：cgroup 内存限制、-XX:+UseContainerSupport',
      '大堆调优：堆外内存（DirectByteBuffer）、NMT 监控',
    ],
    projectTitle: 'JVM 监控面板',
    projectDesc: '通过 JMX 采集 JVM 指标（堆内存、GC、线程、类加载），实现一个实时监控 Web 面板',
    resources: [
      '《Java Performance》- Scott Oaks',
      'G1 调优指南 - Oracle',
      'ZGC 文档 - OpenJDK',
    ],
  },

  {
    dimension: 'jvm',
    fromLevel: 'senior',
    toLevel: 'expert',
    title: 'JVM 内核与前沿技术',
    description: '深入 JVM 内核实现，跟踪前沿 GC 技术和运行时创新',
    estimatedDays: 14,
    topics: [
      'HotSpot 源码精读：VM 运行时、解释器、模板解释器',
      'C2 编译器：Sea of Nodes IR、寄存器分配、指令选择',
      '字节码验证器：类型检查、数据流分析、StackMapTable',
      'JVMTI 深入：Agent 开发、断点调试原理、类重定义',
      'Graal 编译器：作为 JIT 替代、Polyglot 编译、Partial Evaluation',
      'Substrate VM：AOT 编译原理、闭包分析、Heap Dump 支持',
      'Project Loom 对 JVM 的影响：Continuation、Pinning、JFR 适配',
      'GC 前沿：Generational ZGC、C4 收集器、Azul Prime',
    ],
    projectTitle: '自定义 GC 策略模拟器',
    projectDesc: '模拟不同 GC 算法在各种内存分配模式下的表现：停顿时间、吞吐量、内存碎片率对比',
    resources: [
      'HotSpot Internals Wiki',
      '《The Garbage Collection Handbook》',
      'JVM Summit 演讲视频',
    ],
  },

  // ============================================================
  //                   并发编程 (concurrency)
  // ============================================================

  {
    dimension: 'concurrency',
    fromLevel: 'junior',
    toLevel: 'intermediate',
    title: '并发编程基础',
    description: '掌握 Java 并发编程的核心工具，能正确编写多线程代码',
    estimatedDays: 14,
    topics: [
      '线程基础：Thread 生命周期、创建方式、中断机制',
      'synchronized 原理：对象头 Mark Word、锁升级（偏向→轻量→重量）',
      'volatile 语义：可见性保证、禁止重排序、典型使用场景',
      'ReentrantLock：公平锁 vs 非公平锁、Condition 条件变量',
      '线程池：ThreadPoolExecutor 7 大参数、拒绝策略、线程池调优',
      'CountDownLatch vs CyclicBarrier：区别与适用场景',
      'Semaphore 信号量：限流场景、资源池管理',
      'ThreadLocal：原理、内存泄漏风险、InheritableThreadLocal',
      '并发容器：CopyOnWriteArrayList、BlockingQueue 家族',
    ],
    projectTitle: '并发下载器',
    projectDesc: '实现一个多线程文件下载器：分片下载、断点续传、进度统计、线程池管理',
    resources: [
      '《Java 并发编程的艺术》- 方腾飞',
      '《Java Concurrency in Practice》- Brian Goetz',
      'java.util.concurrent 包文档',
    ],
  },

  {
    dimension: 'concurrency',
    fromLevel: 'intermediate',
    toLevel: 'senior',
    title: '并发编程进阶与调优',
    description: '深入并发编程底层原理，掌握高并发场景的调优手段',
    estimatedDays: 18,
    topics: [
      'AQS 原理：state + CLH 队列、独占模式 vs 共享模式',
      '自定义同步器：继承 AQS 实现自己的锁或栅栏',
      'CompletableFuture：异步编排、异常处理、thenCompose vs thenApply',
      'ForkJoinPool：工作窃取算法、RecursiveTask、并行流底层',
      'Disruptor 高性能队列：Ring Buffer、无锁设计、批量消费',
      '原子操作：CAS 原理、Unsafe 类、Atomic 家族源码',
      'Java Memory Model 深入：Store Buffer、Invalid Queue、内存屏障',
      '死锁排查：jstack 分析、死锁检测算法、预防策略',
      '高并发调优：锁分段、无锁化、读写锁、StampedLock',
    ],
    projectTitle: '手写线程池',
    projectDesc: '实现一个简化版 ThreadPoolExecutor：核心线程、最大线程、工作队列、拒绝策略，支持动态调参',
    resources: [
      '《Java 并发编程实战》',
      'Doug Lea 的并发编程论文',
      'AQS 源码分析系列文章',
    ],
  },

  {
    dimension: 'concurrency',
    fromLevel: 'senior',
    toLevel: 'expert',
    title: '并发编程模型与前沿',
    description: '掌握高级并发模型，理解并发编程的理论基础和前沿方向',
    estimatedDays: 14,
    topics: [
      'Actor 模型：Akka 原理、消息传递 vs 共享内存',
      'CSP 模型：Go Channel 对比 Java BlockingQueue',
      '响应式编程：Reactor/RxJava 背压机制、响应式流规范',
      'Structured Concurrency（结构化并发）：JEP 453、TaskScope',
      'Scoped Values（作用域值）：替代 ThreadLocal 的新方案',
      '无锁编程：Michael-Scott 队列、Harris 链表、ABA 问题',
      '事务内存：STM 原理、Clojure STM 对 Java 的启发',
      '并发测试：jcstress 工具、线程安全性验证、线性一致性检查',
      'Virtual Threads 对并发模型的影响：阻塞式代码的复兴',
    ],
    projectTitle: '响应式 HTTP 网关',
    projectDesc: '基于 Project Reactor 实现一个异步非阻塞 HTTP 网关：路由、限流、熔断、请求聚合',
    resources: [
      '《七周七并发模型》',
      'Project Loom JEP 文档',
      'Reactor 官方参考指南',
    ],
  },

  // ============================================================
  //                   Spring 生态 (spring)
  // ============================================================

  {
    dimension: 'spring',
    fromLevel: 'junior',
    toLevel: 'intermediate',
    title: 'Spring Boot 实战',
    description: '熟练使用 Spring Boot 生态，理解核心注解背后的机制',
    estimatedDays: 21,
    topics: [
      'Spring Boot 自动配置原理：@EnableAutoConfiguration、spring.factories',
      'Spring IoC 容器：Bean 生命周期、依赖注入方式（构造器/字段/Setter）',
      'RESTful API 设计：状态码规范、资源命名、HATEOAS',
      '参数校验：@Valid/@Validated、自定义校验器、分组校验',
      '全局异常处理：@ControllerAdvice、@ExceptionHandler、统一错误响应',
      'AOP 编程：切点表达式、通知类型、AOP 代理机制（JDK vs CGLIB）',
      'Spring Data JPA：Repository 接口、Query Method、Specification 动态查询',
      'MyBatis 整合：Mapper XML、动态 SQL、分页插件',
      'Spring Security 基础：认证流程、授权模型、JWT 集成',
      '配置管理：application.yml 多环境、@ConfigurationProperties、自定义 Starter',
    ],
    projectTitle: '博客系统 API',
    projectDesc: '完整的 RESTful 博客后端：用户注册登录（JWT）、文章 CRUD、评论系统、标签管理、分页查询',
    resources: [
      'Spring Boot 官方文档',
      '《Spring Boot 实战》- Craig Walls',
      'Baeldung Spring 系列教程',
    ],
  },

  {
    dimension: 'spring',
    fromLevel: 'intermediate',
    toLevel: 'senior',
    title: 'Spring 源码与原理',
    description: '阅读 Spring 核心源码，理解框架设计思想，具备扩展能力',
    estimatedDays: 21,
    topics: [
      'IoC 容器启动流程：refresh() 12 个步骤精讲',
      'Bean 生命周期深入：实例化→属性填充→初始化→销毁，各扩展点',
      'BeanFactory vs ApplicationContext：延迟加载 vs 即时加载',
      'AOP 代理创建过程：AbstractAutoProxyCreator、拦截器链执行',
      'Spring 事务管理：@Transactional 传播行为、事务失效的 8 种场景',
      'Spring Boot 自动配置源码：条件注解、配置元数据、配置绑定',
      'Spring MVC 请求处理：DispatcherServlet、HandlerMapping、HandlerAdapter',
      '事件机制：ApplicationEvent、@EventListener、异步事件',
      'Spring 扩展点：BeanPostProcessor、BeanFactoryPostProcessor、FactoryBean',
    ],
    projectTitle: '迷你 IoC 容器',
    projectDesc: '实现一个简化版 IoC 容器：支持 @Autowired 注入、Bean 生命周期回调、AOP 代理、条件装配',
    resources: [
      '《Spring 源码深度解析》- 郝佳',
      'Spring Framework 源码 GitHub',
      '小马哥 Spring 源码课',
    ],
  },

  {
    dimension: 'spring',
    fromLevel: 'senior',
    toLevel: 'expert',
    title: 'Spring 生态架构设计',
    description: '掌握 Spring 生态全貌，具备技术选型和架构设计能力',
    estimatedDays: 14,
    topics: [
      'Spring Cloud 微服务全家桶：Gateway、Nacos、Sentinel、Seata',
      'Spring Cloud vs Dubbo：服务治理方案对比与选型',
      'Spring WebFlux：响应式 Web 框架、Mono/Flux 编程模型',
      'Spring Batch：批处理框架、Chunk 处理、Job 调度',
      'Spring Integration：企业集成模式、消息驱动架构',
      'Spring Native：GraalVM Native Image 编译、反射配置',
      'Spring Modulith：模块化单体架构、领域事件自动检测',
      'Spring AI：AI 应用集成框架、向量数据库、RAG 模式',
    ],
    projectTitle: '微服务脚手架',
    projectDesc: '搭建一套完整的微服务开发脚手架：服务注册、配置中心、网关、链路追踪、统一认证',
    resources: [
      'Spring Cloud 官方文档',
      '《微服务架构设计模式》- Chris Richardson',
      'SpringOne 大会演讲',
    ],
  },

  // ============================================================
  //                数据库 & 中间件 (database)
  // ============================================================

  {
    dimension: 'database',
    fromLevel: 'junior',
    toLevel: 'intermediate',
    title: '数据库核心与 SQL 进阶',
    description: '掌握数据库核心原理，写出高质量 SQL，理解索引和事务',
    estimatedDays: 14,
    topics: [
      'MySQL 索引原理：B+ 树结构、聚簇索引 vs 非聚簇索引',
      '索引优化：最左前缀原则、覆盖索引、索引下推（ICP）',
      'EXPLAIN 执行计划：type/key/rows/Extra 各字段含义',
      'SQL 优化：慢查询日志分析、常见反模式（函数包裹索引列、隐式转换）',
      '事务隔离级别：Read Uncommitted → Serializable 各级解决的问题',
      'MVCC 原理：Read View、undo log 版本链、当前读 vs 快照读',
      '锁机制：行锁、间隙锁、临键锁、意向锁',
      'Redis 基础：5 种数据结构、过期策略、内存淘汰机制',
      'Redis 应用场景：缓存、分布式锁、计数器、排行榜',
    ],
    projectTitle: 'SQL 性能分析工具',
    projectDesc: '解析慢查询日志和 EXPLAIN 输出，自动识别性能问题并给出优化建议',
    resources: [
      '《高性能 MySQL》第 4 版',
      '《Redis 设计与实现》- 黄健宏',
      'MySQL 官方文档 - Optimization',
    ],
  },

  {
    dimension: 'database',
    fromLevel: 'intermediate',
    toLevel: 'senior',
    title: '分布式存储与中间件',
    description: '掌握分布式场景下的存储方案和常用中间件原理',
    estimatedDays: 21,
    topics: [
      'MySQL 主从复制：异步复制、半同步复制、GTID 复制',
      '分库分表：垂直拆分 vs 水平拆分、ShardingSphere 实战',
      '读写分离：中间件实现 vs 应用层实现、主从延迟处理',
      'Redis 高可用：哨兵模式、Cluster 集群、数据分片策略',
      'Redis 深入：持久化（RDB/AOF/混合）、大 Key 排查、热 Key 问题',
      'Kafka 原理：分区机制、副本同步、ISR、消费者组再平衡',
      'Kafka 调优：吞吐量 vs 延迟、Exactly-Once 语义、事务消息',
      'Elasticsearch：倒排索引原理、分词器、查询 DSL、聚合分析',
      '分布式缓存设计：缓存穿透（布隆过滤器）、击穿（互斥锁）、雪崩（随机过期）',
      'MongoDB 基础：文档模型、索引类型、聚合管道',
    ],
    projectTitle: '分布式缓存中间层',
    projectDesc: '基于 Redis 实现一个带 LRU 本地缓存、缓存预热、降级策略的二级缓存中间层',
    resources: [
      '《Redis 深度历险》- 钱文品',
      'Apache Kafka 官方文档',
      '《Elasticsearch 权威指南》',
    ],
  },

  {
    dimension: 'database',
    fromLevel: 'senior',
    toLevel: 'expert',
    title: '存储引擎与数据架构',
    description: '深入存储引擎原理，具备数据架构设计和选型能力',
    estimatedDays: 14,
    topics: [
      'MySQL 存储引擎深入：InnoDB 架构、Buffer Pool、Change Buffer、redo log',
      'InnoDB 事务实现：MVCC 底层、purge 机制、checkpoint 策略',
      'NewSQL 数据库：TiDB 架构、Percolator 事务模型、Raft 共识',
      '列式存储：ClickHouse MergeTree 引擎、向量化执行、物化视图',
      '时序数据库：InfluxDB/TDengine 时序数据模型、降采样策略',
      '图数据库：Neo4j 属性图模型、Cypher 查询、适用场景',
      '分布式事务：2PC/3PC、TCC、SAGA 模式、Seata 实现',
      '数据一致性：CAP 定理实战、Raft/Paxos 共识算法、CRDT',
      '数据湖与湖仓一体：Delta Lake/Iceberg、Schema Evolution',
    ],
    projectTitle: '迷你数据库引擎',
    projectDesc: '实现一个简化版 KV 存储引擎：LSM-Tree 结构、WAL 日志、SSTable 合并、布隆过滤器',
    resources: [
      '《数据密集型应用系统设计》- Martin Kleppmann',
      'CMU 15-445 数据库课程',
      'PingCAP 技术博客',
    ],
  },

  // ============================================================
  //                  架构 & 设计 (architecture)
  // ============================================================

  {
    dimension: 'architecture',
    fromLevel: 'junior',
    toLevel: 'intermediate',
    title: '工程化与设计基础',
    description: '掌握软件工程基本实践和常用设计模式',
    estimatedDays: 14,
    topics: [
      '设计模式：单例、工厂、策略、观察者、模板方法 — 实际应用场景',
      'SOLID 原则：每个原则的违反案例和重构方法',
      'RESTful 架构：资源设计、状态转移、HATEOAS、版本管理',
      'Git 工作流：Git Flow vs Trunk-Based、分支策略、Code Review',
      '单元测试：JUnit 5、Mockito、测试覆盖率、测试金字塔',
      'Docker 基础：Dockerfile 编写、多阶段构建、docker-compose',
      'CI/CD 流水线：GitHub Actions/Jenkins、自动化测试、构建、部署',
      '日志规范：SLF4J + Logback、结构化日志、日志级别管理',
      'API 文档：Swagger/OpenAPI、自动生成、Mock 服务',
    ],
    projectTitle: 'CI/CD 全流程',
    projectDesc: '为一个 Spring Boot 项目搭建完整的 CI/CD：代码检查→单元测试→构建镜像→部署到 K8s',
    resources: [
      '《重构》- Martin Fowler',
      'Docker 官方文档',
      'GitHub Actions 文档',
    ],
  },

  {
    dimension: 'architecture',
    fromLevel: 'intermediate',
    toLevel: 'senior',
    title: '分布式系统设计',
    description: '掌握分布式系统核心问题与解决方案，具备独立设计中等规模系统的能力',
    estimatedDays: 28,
    topics: [
      '分布式一致性理论：CAP 定理、BASE 理论、一致性模型对比',
      '分布式锁：Redis SETNX、Redlock 算法、ZooKeeper 临时节点',
      '分布式事务：TCC 补偿事务、SAGA 编排模式、最终一致性',
      'RPC 框架：gRPC/Thrift 协议对比、序列化、负载均衡、超时重试',
      '服务治理：服务注册发现（Nacos/Eureka）、熔断（Sentinel/Hystrix）、降级',
      '消息队列架构：Kafka vs RocketMQ 选型、消息可靠性、顺序消息',
      '限流算法：令牌桶、漏桶、滑动窗口、分布式限流实现',
      '系统可用性：SLA 计算、故障演练、混沌工程入门',
      '性能优化：压测工具（JMeter/wrk）、QPS/TPS/P99 延迟分析',
      '高并发架构：缓存、异步、分库分表、读写分离组合策略',
    ],
    projectTitle: '迷你 RPC 框架',
    projectDesc: '实现一个简化版 RPC 框架：自定义协议、Protobuf 序列化、服务注册、动态代理、负载均衡',
    resources: [
      '《分布式系统：概念与设计》- George Coulouris',
      'Martin Fowler 架构系列文章',
      '字节跳动/阿里技术博客',
    ],
  },

  {
    dimension: 'architecture',
    fromLevel: 'senior',
    toLevel: 'expert',
    title: '架构方法论与技术领导力',
    description: '掌握架构设计方法论，具备技术决策和技术领导能力',
    estimatedDays: 21,
    topics: [
      '架构设计方法论：需求分析→容量估算→概要设计→详细设计→评审',
      'DDD 战略设计：限界上下文、上下文映射、统一语言',
      'DDD 战术设计：实体、值对象、聚合根、领域事件、CQRS',
      '架构模式：微服务、事件驱动、六边形架构、洋葱架构',
      '架构演进：单体→微服务→Serverless 的决策框架',
      '技术选型方法论：POC 验证、技术雷达、风险评估矩阵',
      '技术债务管理：识别、量化、偿还策略、重构时机',
      '可观测性架构：Metrics（Prometheus）、Logging（ELK）、Tracing（Jaeger）',
      '云原生架构：Kubernetes、Service Mesh、GitOps、渐进式发布',
    ],
    projectTitle: '架构设计文档',
    projectDesc: '为一个真实业务场景（如秒杀系统）输出完整架构设计文档：需求分析、方案对比、详细设计、容量评估、风险分析',
    resources: [
      '《软件架构架构》- Mark Richards',
      '《领域驱动设计》- Eric Evans',
      'ThoughtWorks 技术雷达',
    ],
  },
]
