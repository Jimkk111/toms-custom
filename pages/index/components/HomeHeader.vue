<template>
    <view class="header">
        <view class="place" :style="{height:statusBarHeight + 'px'}">
            
        </view>
        <view class="context" :style="{height:capsuleBarHeight + 'px'}">
            
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

}

</style>