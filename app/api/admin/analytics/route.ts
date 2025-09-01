import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    // 验证管理员权限
    if (!session?.user?.userId) {
      return NextResponse.json({ 
        error: 'Authentication required' 
      }, { status: 401 });
    }

    const adminUser = await prisma.user.findUnique({
      where: { id: session.user.userId as string }
    });

    if (!adminUser || adminUser.role !== 'ADMIN') {
      return NextResponse.json({ 
        error: 'Admin access required' 
      }, { status: 403 });
    }

    // 并行获取所有统计数据
    const [
      totalUsers,
      totalVideos,
      totalSubscriptions,
      activeSubscriptions,
      totalWatchRecords,
      usersByRole,
      videosByCategory,
      subscriptionsByPlan,
      recentActivity,
      topVideos,
      userStats,
      revenueData
    ] = await Promise.all([
      // 总用户数
      prisma.user.count(),
      
      // 总视频数
      prisma.video.count(),
      
      // 总订阅数
      prisma.subscription.count(),
      
      // 活跃订阅数
      prisma.subscription.count({
        where: {
          status: 'ACTIVE',
          endDate: { gte: new Date() }
        }
      }),
      
      // 总观看记录数
      prisma.watchHistory.count(),
      
      // 按角色分组的用户
      prisma.user.groupBy({
        by: ['role'],
        _count: {
          id: true
        }
      }),
      
      // 按分类分组的视频
      prisma.video.groupBy({
        by: ['categoryId'],
        _count: {
          id: true
        }
      }),
      
      // 按计划分组的订阅
      prisma.subscription.groupBy({
        by: ['planId'],
        _count: {
          id: true
        },
        where: {
          status: 'ACTIVE'
        }
      }),
      
      // 最近活动（最近7天的观看记录）
      prisma.watchHistory.findMany({
        where: {
          watchedAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          }
        },
        include: {
          user: {
            select: {
              id: true,
              name: true
            }
          },
          video: {
            select: {
              id: true,
              title: true
            }
          }
        },
        orderBy: {
          watchedAt: 'desc'
        },
        take: 20
      }),
      
      // 热门视频（按观看次数排序）
      prisma.video.findMany({
        include: {
          category: true,
          watchHistories: {
            select: {
              id: true,
              progress: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 10
      }),
      
      // 用户统计（最近30天新用户）
      prisma.user.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          }
        }
      }),
      
      // 收入数据（活跃订阅）
      prisma.subscription.findMany({
        where: {
          status: 'ACTIVE'
        },
        include: {
          plan: {
            select: {
              price: true,
              name: true
            }
          }
        }
      })
    ]);

    // 处理视频分类统计
    const videoCategories = await prisma.videoCategory.findMany();
    const videoByCategoryWithNames = videosByCategory.map((item) => {
      const category = videoCategories.find(cat => cat.id === item.categoryId);
      return {
        categoryId: item.categoryId,
        categoryName: category?.name || 'Unknown',
        count: item._count.id
      };
    });

    // 处理订阅计划统计
    const subscriptionPlans = await prisma.subscriptionPlan.findMany();
    const subscriptionsByPlanWithNames = subscriptionsByPlan.map(item => {
      const plan = subscriptionPlans.find(p => p.id === item.planId);
      return {
        planId: item.planId,
        planName: plan?.name || 'Unknown',
        count: item._count.id
      };
    });

    // 处理热门视频统计
    const topVideosWithStats = topVideos.map(video => {
      const watchCount = video.watchHistories.length;
      const totalWatchTime = video.watchHistories.length; // 使用观看次数代替观看时长
      const avgProgress = watchCount > 0 
        ? video.watchHistories.reduce((sum, h) => sum + h.progress, 0) / watchCount 
        : 0;
      
      return {
        id: video.id,
        title: video.title,
        category: video.category.name,
        watchCount,
        totalWatchTime,
        avgProgress: Math.round(avgProgress * 100) / 100,
        completionRate: video.watchHistories.filter(h => h.progress >= 0.9).length / Math.max(watchCount, 1)
      };
    }).sort((a, b) => b.watchCount - a.watchCount);

    // 计算收入统计
    const totalRevenue = revenueData.reduce((sum, sub) => sum + sub.plan.price, 0);
    const revenueByPlan = subscriptionPlans.map(plan => {
      const count = revenueData.filter(sub => sub.plan.name === plan.name).length;
      return {
        planName: plan.name,
        count,
        revenue: count * plan.price
      };
    });

    // 计算趋势数据（最近7天）
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    }).reverse();

    const dailyStats = await Promise.all(
      last7Days.map(async (date) => {
        const startOfDay = new Date(date + 'T00:00:00Z');
        const endOfDay = new Date(date + 'T23:59:59Z');
        
        const [newUsers, videoViews, newSubscriptions] = await Promise.all([
          prisma.user.count({
            where: {
              createdAt: {
                gte: startOfDay,
                lte: endOfDay
              }
            }
          }),
          prisma.watchHistory.count({
            where: {
              watchedAt: {
                gte: startOfDay,
                lte: endOfDay
              }
            }
          }),
          prisma.subscription.count({
            where: {
              createdAt: {
                gte: startOfDay,
                lte: endOfDay
              }
            }
          })
        ]);

        return {
          date,
          newUsers,
          videoViews,
          newSubscriptions
        };
      })
    );

    return NextResponse.json({
      overview: {
        totalUsers,
        totalVideos,
        totalSubscriptions,
        activeSubscriptions,
        totalWatchRecords: totalWatchRecords,
        newUsersLast30Days: userStats,
        totalRevenue,
        conversionRate: totalUsers > 0 ? (activeSubscriptions / totalUsers) * 100 : 0
      },
      
      userStats: {
        byRole: usersByRole.map(item => ({
          role: item.role,
          count: item._count.id
        })),
        newUsersLast30Days: userStats
      },
      
      videoStats: {
        byCategory: videoByCategoryWithNames,
        topVideos: topVideosWithStats.slice(0, 5)
      },
      
      subscriptionStats: {
        byPlan: subscriptionsByPlanWithNames,
        activeVsTotal: {
          active: activeSubscriptions,
          total: totalSubscriptions,
          activeRate: totalSubscriptions > 0 ? (activeSubscriptions / totalSubscriptions) * 100 : 0
        }
      },
      
      revenueStats: {
        total: totalRevenue,
        byPlan: revenueByPlan,
        averageRevenuePerUser: totalUsers > 0 ? totalRevenue / totalUsers : 0
      },
      
      activityStats: {
        recentActivity: recentActivity.map(activity => ({
          id: activity.id,
          user: activity.user,
          video: activity.video,
          progress: activity.progress,
          watchedAt: activity.watchedAt
        })),
        dailyTrends: dailyStats
      }
    });

  } catch (error) {
    console.error('Admin analytics API error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
