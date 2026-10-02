<template>
    <view class="header">
        <view class="place" :style="{height:statusBarHeight + 'px'}">

        </view>
        <view class="context" :style="{height:capsuleBarHeight + 'px'}">
            <!-- 左侧个人中心入口 -->
            <view class="my-btn" @click="goMy">
                <view class="my-icon">
                    <view class="head"></view>
                    <view class="body"></view>
                </view>
            </view>
        </view>
    </view>
</template>
<script>
import { mapState } from 'pinia'
import { useAppStore } from '../../../stores/app'

export default {
    data:() => {
        return {

        }
    },
    methods:{
        goMy() {
            uni.navigateTo({ url: '/pages/my/my' })
        }
    },
    computed:{
        ...mapState(useAppStore,['statusBarHeight','capsuleBarHeight'])
    }
}

</script>

<style lang="scss">
.header{
    .place,
    .context{
        background: $nav-gradient;
    }

    .context{
        position: relative;

        .my-btn{
            display: flex;
            align-items: center;
            height: 100%;
            padding-left: 24rpx;
        }

        .my-icon{                          // CSS 画的白色人形：圆头 + 半圆肩
            position: relative;
            width: 40rpx;
            height: 40rpx;

            .head{
                position: absolute;
                top: 4rpx;
                left: 50%;
                transform: translateX(-50%);
                width: 16rpx;
                height: 16rpx;
                border-radius: 50%;
                background-color: #fff;
            }

            .body{
                position: absolute;
                bottom: 4rpx;
                left: 50%;
                transform: translateX(-50%);
                width: 32rpx;
                height: 14rpx;
                border-radius: 16rpx 16rpx 0 0;
                background-color: #fff;
            }
        }
    }
}
</style>
