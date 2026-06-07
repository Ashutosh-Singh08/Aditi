class Solution {
public:
    vector<vector<int>> generate(int numRows) {
        vector<vector<int>> pt;
        vector<int>temp;
        for(int i=0;i<numRows;i++){
            vector<int>v;
            for(int j=0;j<=i;j++){
                if(j==0||j==i){
                    v[j]=1;
                }
               else{ v[j]=(temp[j-1]+temp[j]);}
            }
            pt.push_back(v);
            temp=v;
        }
        return pt;
    }
};