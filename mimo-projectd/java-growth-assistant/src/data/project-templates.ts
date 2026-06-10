import type { ProjectTemplate } from '../types'

export const projectTemplates: ProjectTemplate[] = [
  // ==================== Java 基础 ====================
  {
    id: 'custom-hashmap',
    title: '手写 HashMap',
    description: '实现一个简化版的 HashMap，深入理解哈希表原理',
    difficulty: 'easy',
    dimension: 'javaBasics',
    techStack: ['Java', '数据结构'],
    learningGoals: [
      '理解哈希函数的设计',
      '理解哈希冲突的解决方案（链地址法）',
      '理解扩容机制（rehash）',
    ],
    codeExample: `public class MyHashMap<K, V> {
    private static final int DEFAULT_CAPACITY = 16;
    private static final float LOAD_FACTOR = 0.75f;
    private Entry<K, V>[] table;
    private int size;

    static class Entry<K, V> {
        K key; V value; Entry<K, V> next;
        Entry(K key, V value, Entry<K, V> next) {
            this.key = key; this.value = value; this.next = next;
        }
    }

    public V put(K key, V value) {
        int hash = hash(key);
        int index = hash & (table.length - 1);
        // 遍历链表查找或新增...
    }
}`,
    steps: [
      { order: 1, title: '定义数据结构', description: '创建 Entry 类和数组结构', hints: ['Entry 需要 key, value, next 指针'], codeExample: 'static class Entry<K, V> { K key; V value; Entry<K,V> next; }' },
      { order: 2, title: '实现 put 方法', description: '计算哈希值，处理冲突', hints: ['用位运算代替取模提高效率'], codeExample: 'int hash = key.hashCode() ^ (key.hashCode() >>> 16);' },
      { order: 3, title: '实现 get 方法', description: '根据 key 查找 value', hints: ['遍历链表比较 key'] },
      { order: 4, title: '实现扩容', description: '当负载因子超过阈值时扩容', hints: ['默认负载因子 0.75'], codeExample: 'if (size >= table.length * LOAD_FACTOR) resize();' },
      { order: 5, title: '测试验证', description: '写单元测试验证正确性', hints: ['测试 put、get、resize、冲突处理'] },
    ],
    resources: [
      { title: 'HashMap 源码分析', url: 'https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/HashMap.html' },
      { title: 'Java 集合框架', url: 'https://docs.oracle.com/en/java/javase/21/core/collections-framework.html' },
    ],
  },
  {
    id: 'stream-utils',
    title: 'Stream 工具库',
    description: '封装常用的 Stream 操作，掌握函数式编程',
    difficulty: 'easy',
    dimension: 'javaBasics',
    techStack: ['Java', 'Stream API', 'Lambda'],
    learningGoals: [
      '掌握 Stream 的中间操作和终端操作',
      '理解惰性求值机制',
      '熟练使用 Collectors 工具类',
    ],
    steps: [
      { order: 1, title: '集合转换工具', description: '实现 List/Map/Set 之间的便捷转换方法', hints: ['toMap 要处理 key 冲突'], codeExample: 'list.stream().collect(Collectors.toMap(Student::getId, Function.identity()))' },
      { order: 2, title: '分组与分区', description: '实现按条件分组、分区的工具方法', hints: ['groupingBy + counting'], codeExample: 'list.stream().collect(Collectors.groupingBy(Student::getGrade, Collectors.counting()))' },
      { order: 3, title: '扁平化处理', description: '实现嵌套集合的扁平化工具', hints: ['flatMap 的使用'] },
      { order: 4, title: '性能对比', description: '对比 Stream 和传统 for 循环的性能', hints: ['用 JMH 做基准测试'] },
    ],
    resources: [
      { title: 'Stream API 官方教程', url: 'https://docs.oracle.com/en/java/javase/21/core/streams.html' },
      { title: 'JMH 基准测试', url: 'https://github.com/openjdk/jmh' },
    ],
  },

  // ==================== JVM ====================
  {
    id: 'gc-visualizer',
    title: 'GC 日志可视化工具',
    description: '解析 GC 日志，用图表展示 GC 行为',
    difficulty: 'medium',
    dimension: 'jvm',
    techStack: ['Java', '文件IO', '正则表达式'],
    learningGoals: [
      '理解 GC 日志格式',
      '掌握 JVM 内存分代模型',
      '学会分析 GC 性能指标',
    ],
    steps: [
      { order: 1, title: 'GC 日志解析', description: '用正则解析 GC 日志的每一行', hints: ['关注 GC 类型、耗时、内存变化'] },
      { order: 2, title: '数据模型', description: '定义 GC 事件的数据结构', hints: ['包含时间戳、GC类型、前后内存、耗时'] },
      { order: 3, title: '统计分析', description: '计算 GC 频率、平均耗时、最大停顿', hints: ['区分 Young GC 和 Full GC'] },
      { order: 4, title: '输出报告', description: '生成文本报告或 CSV', hints: ['按时间段聚合统计'] },
    ],
    resources: [
      { title: 'GC 日志格式详解', url: 'https://docs.oracle.com/en/java/javase/21/vm/garbage-collection-implementation.html' },
      { title: 'G1 GC 调优指南', url: 'https://docs.oracle.com/en/java/javase/21/gctuning/garbage-first-g1-garbage-collector.html' },
    ],
  },

  // ==================== 并发编程 ====================
  {
    id: 'custom-threadpool',
    title: '手写线程池',
    description: '实现一个简化版的 ThreadPoolExecutor',
    difficulty: 'hard',
    dimension: 'concurrency',
    techStack: ['Java', '并发', 'AQS'],
    learningGoals: [
      '理解线程池的工作原理',
      '理解 BlockingQueue 的实现',
      '理解拒绝策略的设计',
    ],
    steps: [
      { order: 1, title: '任务队列', description: '实现一个简单的 BlockingQueue', hints: ['用 wait/notify 或 Lock/Condition'] },
      { order: 2, title: '核心执行逻辑', description: '实现 Worker 线程和任务调度', hints: ['核心线程 → 队列 → 最大线程 → 拒绝'] },
      { order: 3, title: '拒绝策略', description: '实现 AbortPolicy、CallerRunsPolicy', hints: ['策略模式'] },
      { order: 4, title: '优雅关闭', description: '实现 shutdown 和 shutdownNow', hints: ['中断线程 + 等待任务完成'] },
      { order: 5, title: '测试与对比', description: '和 JDK 的 ThreadPoolExecutor 对比', hints: ['用同样的任务测试吞吐量'] },
    ],
    resources: [
      { title: 'ThreadPoolExecutor 源码', url: 'https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/concurrent/ThreadPoolExecutor.html' },
      { title: 'Java 并发编程实战', url: 'https://jcip.net/' },
    ],
  },

  // ==================== Spring ====================
  {
    id: 'mini-spring',
    title: '迷你 Spring IoC 容器',
    description: '实现一个简化版的 Spring IoC 容器',
    difficulty: 'hard',
    dimension: 'spring',
    techStack: ['Java', '反射', '注解', '设计模式'],
    learningGoals: [
      '理解 IoC 容器的核心原理',
      '理解依赖注入的实现方式',
      '理解 Bean 的生命周期管理',
    ],
    steps: [
      { order: 1, title: '注解定义', description: '定义 @Component, @Autowired, @Value 注解', hints: ['用 @Retention(RUNTIME)'] },
      { order: 2, title: '包扫描', description: '扫描指定包下所有带 @Component 的类', hints: ['ClassLoader.getResources'] },
      { order: 3, title: 'Bean 创建', description: '反射创建实例并放入容器', hints: ['用 ConcurrentHashMap 存储'] },
      { order: 4, title: '依赖注入', description: '解析 @Autowired 并注入依赖', hints: ['注意循环依赖问题'] },
      { order: 5, title: '生命周期', description: '支持 @PostConstruct 和 @PreDestroy', hints: ['invokeMethods + 反射调用'] },
    ],
    resources: [
      { title: 'Spring IoC 源码', url: 'https://github.com/spring-projects/spring-framework' },
      { title: '手写 Spring 教程', url: 'https://www.baeldung.com/inversion-control' },
    ],
  },
  {
    id: 'blog-api',
    title: '博客系统 REST API',
    description: '完整的博客后端，涵盖常见 Web 开发场景',
    difficulty: 'medium',
    dimension: 'spring',
    techStack: ['Spring Boot', 'MyBatis', 'MySQL', 'JWT'],
    learningGoals: [
      '掌握 RESTful API 设计',
      '掌握参数校验和异常处理',
      '掌握 JWT 认证机制',
    ],
    steps: [
      { order: 1, title: '项目骨架', description: '初始化 Spring Boot 项目，配置数据源', hints: ['用 Spring Initializr'] },
      { order: 2, title: '用户模块', description: '注册、登录、JWT 签发与验证', hints: ['用 jjwt 库'] },
      { order: 3, title: '文章模块', description: 'CRUD + 分页 + 标签关联', hints: ['MyBatis 分页插件'] },
      { order: 4, title: '评论模块', description: '文章评论，支持嵌套回复', hints: ['树形结构查询'] },
      { order: 5, title: '全局异常处理', description: '@ControllerAdvice 统一异常处理', hints: ['自定义业务异常'] },
    ],
    resources: [
      { title: 'Spring Boot 官方文档', url: 'https://spring.io/projects/spring-boot' },
      { title: 'JWT 认证详解', url: 'https://jwt.io/introduction' },
    ],
  },

  // ==================== 数据库 & 中间件 ====================
  {
    id: 'short-url',
    title: '短链接服务',
    description: '实现高并发短链接生成和跳转服务',
    difficulty: 'medium',
    dimension: 'database',
    techStack: ['Spring Boot', 'Redis', 'MySQL'],
    learningGoals: [
      '理解分布式 ID 生成方案',
      '掌握缓存策略',
      '理解布隆过滤器的应用',
    ],
    steps: [
      { order: 1, title: '短链生成', description: '用雪花算法或 Base62 编码生成短链', hints: ['自增 ID + Base62'] },
      { order: 2, title: '存储设计', description: 'MySQL 存储映射关系，Redis 做缓存', hints: ['短链 → 长链的映射'] },
      { order: 3, title: '跳转服务', description: '302 重定向实现', hints: ['先查缓存再查 DB'] },
      { order: 4, title: '访问统计', description: '记录 PV/UV，用 Redis 计数', hints: ['HyperLogLog 统计 UV'] },
      { order: 5, title: '过期清理', description: '定时清理过期短链', hints: ['ScheduledTask + 批量删除'] },
    ],
    resources: [
      { title: '短链接系统设计', url: 'https://www.educative.io/courses/grokking-modern-system-design-interview' },
      { title: 'Base62 编码', url: 'https://en.wikipedia.org/wiki/Base62' },
    ],
  },
  {
    id: 'distributed-lock',
    title: '分布式锁实现',
    description: '基于 Redis 实现分布式锁',
    difficulty: 'hard',
    dimension: 'database',
    techStack: ['Java', 'Redis', 'Lua'],
    learningGoals: [
      '理解分布式锁的使用场景',
      '理解 Redis SETNX 的原理',
      '理解锁续期和可重入设计',
    ],
    steps: [
      { order: 1, title: '基础锁', description: '用 SET NX EX 实现最简锁', hints: ['原子操作是关键'] },
      { order: 2, title: '锁续期', description: '看门狗机制自动续期', hints: ['ScheduledExecutorService'] },
      { order: 3, title: '可重入锁', description: '用 Hash 结构支持同一线程重入', hints: ['field=threadId, value=count'] },
      { order: 4, title: '释放锁', description: 'Lua 脚本保证原子性释放', hints: ['先判断持有者再删除'] },
      { order: 5, title: '测试验证', description: '多线程并发测试', hints: ['模拟超时、重入、竞争'] },
    ],
    resources: [
      { title: 'Redis 分布式锁 Redlock', url: 'https://redis.io/docs/latest/develop/use/patterns/distributed-locks/' },
      { title: 'Redisson 分布式锁', url: 'https://github.com/redisson/redisson' },
    ],
  },

  // ==================== 架构 ====================
  {
    id: 'mini-rpc',
    title: '迷你 RPC 框架',
    description: '从零实现一个简化版的 RPC 框架',
    difficulty: 'expert',
    dimension: 'architecture',
    techStack: ['Java', 'Netty', 'ZooKeeper', '序列化'],
    learningGoals: [
      '理解 RPC 调用的完整流程',
      '理解动态代理和网络通信',
      '理解服务注册与发现',
    ],
    steps: [
      { order: 1, title: '自定义协议', description: '设计 RPC 通信协议（请求/响应）', hints: ['魔数 + 版本 + 序列化方式 + 消息体'] },
      { order: 2, title: '序列化', description: '实现 JSON / Protobuf 序列化', hints: ['策略模式切换序列化方式'] },
      { order: 3, title: '网络传输', description: '用 Netty 实现 TCP 通信', hints: ['编解码器 + 请求分发'] },
      { order: 4, title: '动态代理', description: '客户端通过代理调用远程方法', hints: ['JDK Proxy 或 ByteBuddy'] },
      { order: 5, title: '服务注册', description: '用 ZooKeeper 做服务注册与发现', hints: ['临时节点 + Watch 机制'] },
      { order: 6, title: '负载均衡', description: '实现随机、轮询、加权策略', hints: ['策略模式'] },
    ],
    resources: [
      { title: 'Netty 官方文档', url: 'https://netty.io/wiki/' },
      { title: 'Dubbo 架构设计', url: 'https://dubbo.apache.org/zh/docs/' },
      { title: 'gRPC Java', url: 'https://grpc.io/docs/languages/java/' },
    ],
  },
  {
    id: 'event-bus',
    title: '事件总线系统',
    description: '实现一个进程内的事件发布/订阅系统',
    difficulty: 'medium',
    dimension: 'architecture',
    techStack: ['Java', '注解', '反射', '并发'],
    learningGoals: [
      '理解观察者模式的工程实践',
      '理解事件驱动架构',
      '掌握线程安全的事件分发',
    ],
    steps: [
      { order: 1, title: '注解定义', description: '定义 @Subscribe 注解标记监听方法', hints: ['支持指定事件类型'] },
      { order: 2, title: '注册中心', description: '扫描并注册所有订阅者', hints: ['ConcurrentHashMap 存储'] },
      { order: 3, title: '事件分发', description: '同步和异步两种分发模式', hints: ['异步用线程池'] },
      { order: 4, title: '异常处理', description: '订阅者异常不影响其他订阅者', hints: ['ErrorHandler 回调'] },
    ],
    resources: [
      { title: 'Guava EventBus', url: 'https://github.com/google/guava/wiki/EventBusExplained' },
      { title: '观察者模式', url: 'https://refactoring.guru/design-patterns/observer' },
    ],
  },
]
